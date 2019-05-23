import { cleanup } from "../../lib/git";
import { getRefId } from "../../lib/util/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import { deleteCluster, deleteLoadBalancer } from "../../api";
import {
  getClusterName,
  getLoadBalancer
} from "../../lib/loadBalancer/getLoadBalancer";
import { Request } from "../../interfaces/Request";
import { PrState, ClusterState } from "../../interfaces/Release";

import {
  clusterExists,
  getClusterByName
} from "../../lib/cluster/checkCluster";

export const deleteClusterAndUpdate = async (
  clusterId: string,
  refId: string,
  sha: string
) => {
  await deleteCluster(clusterId);

  await saveReleaseToDB({
    refId,
    sha,
    cluster_id: null,
    pr_state: PrState["closed" as PrState],
    cluster_state: ClusterState["deleted"],
    config: ""
  });
};

const updateRelease = async (req: Request, sha: string) => {
  const body = req.body;
  const refId = getRefId(body);

  if (!refId) return { cluster_id: "" };

  const record = await getRelease({ refId });

  if (!record || !record.cluster_id) {
    await saveReleaseToDB({
      refId,
      sha,
      pr_state: PrState["in_progress" as PrState],
      cluster_state: ClusterState["deleted"],
      config: ""
    });

    console.log("failed to find record or id not set");
    return { cluster_id: "" };
  }

  return record;
};

export const cleanupLoadBalancer = async (clusterId: string) => {
  const name = await getClusterName(clusterId);

  if (name instanceof Error) {
    return false;
  }

  const balancer = await getLoadBalancer(name);

  console.log("== balancer ==");
  console.log(balancer);

  if (!balancer || balancer instanceof Error || !balancer.id) {
    return false;
  }

  await deleteLoadBalancer(balancer.id);
};

export const close = async (req: Request): Promise<string | false> => {
  const body = req.body;
  const sha = body.pull_request.head.sha;
  const refId = getRefId(body);

  cleanup(sha);

  const record = await updateRelease(req, sha);

  if (!refId || !record.cluster_id) {
    return false;
  }

  let result = await clusterExists(req);

  if (result) {
    console.log(`get cluster`);
    const cluster = await getClusterByName(name);

    if (cluster && cluster.id) {
      const clusterId = cluster.id;

      if (refId) {
        console.log("cleanupLoadBalancer");
        try {
          await cleanupLoadBalancer(clusterId);
        } catch (e) {
          console.log("cleanupLoadBalancer", e.message);
        }

        //

        try {
          // delete the cluster deletes the droplet????
          await deleteClusterAndUpdate(clusterId, refId, "123");
        } catch (e) {
          console.log("deleteClusterAndUpdate", e.message);
        }
      }

      console.log(`refId: ${refId}`);
    }
  }
  return refId;
};
