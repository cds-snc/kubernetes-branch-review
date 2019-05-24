import { cleanup } from "../git";
import { saveReleaseToDB } from "../../db/queries";
import { deleteCluster, deleteLoadBalancer } from "../../api";
import {
  getClusterName,
  getLoadBalancer
} from "../loadBalancer/getLoadBalancer";
import { Request } from "../../interfaces/Request";
import { PrState, ClusterState } from "../../interfaces/Release";
import { ensureRefId } from "../util/ensureRefId";
import { getClusterByName } from "../cluster/checkCluster";

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

const closeRelease = async (req: Request, sha: string) => {
  const refId = ensureRefId(req);
  await saveReleaseToDB({
    refId,
    sha,
    pr_state: PrState["in_progress" as PrState],
    cluster_state: ClusterState["deleted"],
    config: ""
  });
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
  const refId = ensureRefId(req);

  cleanup(sha);
  await closeRelease(req, sha);

  const cluster = await getClusterByName(name);

  if (cluster && cluster.id) {
    await cleanupLoadBalancer(cluster.id);
    await deleteClusterAndUpdate(cluster.id, refId, sha);
  }

  return refId;
};
