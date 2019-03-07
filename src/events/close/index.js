import { getRefId } from "../../lib/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import { deleteCluster, deleteLoadBalancer } from "../../api";
import { getClusterName, getLoadBalancer } from "../../lib/getLoadBalancer";

export const close = async (req, release) => {
  const body = req.body;
  const sha = body.pull_request.head.sha;
  const refId = getRefId(body);
  const record = await getRelease({ refId });

  if (!record || !record.cluster_id) {
    await saveReleaseToDB({
      refId,
      sha,
      pr_state: "closed",
      cluster_state: "deleted",
      config: ""
    });
    return "failed to find record or id not set";
  }

  const clusterId = record.cluster_id;
  const result = await deleteCluster(clusterId);

  try {
    const name = await getClusterName(clusterId);
    const balancer = await getLoadBalancer(name);
    const result = await deleteLoadBalancer(balancer.id);
    console.log(result);
  } catch (e) {
    console.log("delete load balancer");
    console.log(e.message);
  }

  console.log(result);

  await saveReleaseToDB({
    refId,
    sha,
    cluster_id: null,
    pr_state: "closed",
    cluster_state: "deleted",
    config: ""
  });

  return refId;
};
