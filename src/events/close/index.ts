import { cleanup } from "../../lib/git";
import { getRefId } from "../../lib/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import { deleteCluster, deleteLoadBalancer } from "../../api";
import { getClusterName, getLoadBalancer } from "../../lib/getLoadBalancer";
import { Request } from "../../interfaces/Request";
import { PrState, ClusterState } from "../../interfaces/Release";

const deleteClusterAndUpdate = async (
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

const cleanupLoadBalancer = async (clusterId: string) => {
  const name = await getClusterName(clusterId);

  if (name instanceof Error) {
    return false;
  }

  const balancer = await getLoadBalancer(name);

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

  const clusterId = record.cluster_id;

  try {
    await cleanupLoadBalancer(clusterId);
    await deleteClusterAndUpdate(clusterId, refId, sha);
  } catch (e) {
    console.log("delete load balancer", e.message);
  }

  return refId;
};
