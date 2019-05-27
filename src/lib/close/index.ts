import { cleanup } from "../git";
import { deleteCluster, deleteLoadBalancer } from "../../api";
import { PrState, ClusterState, Request } from "../../interfaces";
import {
  ensureRefId,
  getName,
  saveReleaseToDB,
  getClusterName,
  getLoadBalancer,
  getClusterByName
} from "../../lib";

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
  const name = getName(req);
  const cluster = await getClusterByName(name);

  if (cluster && cluster.id) {
    await cleanupLoadBalancer(cluster.id);
    await deleteClusterAndUpdate(cluster.id, refId, sha);
  }

  return refId;
};
