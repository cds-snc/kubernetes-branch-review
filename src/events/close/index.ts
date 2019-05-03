import { cleanup } from "../../lib/git";
import { getRefId } from "../../lib/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import { deleteCluster, deleteLoadBalancer } from "../../api";
import { getClusterName, getLoadBalancer } from "../../lib/getLoadBalancer";
import { Request} from "../../interfaces/Request";
import { Release, PrState, ClusterState } from "../../interfaces/Release";

export const close = async (req: Request, release: Release): Promise<string|false> => {

  const body = req.body;
  const sha = body.pull_request.head.sha;
  const refId = getRefId(body);

  if(refId){

    const record = await getRelease({ refId });

    if (!record || !record.cluster_id) {
      await saveReleaseToDB({
        refId,
        sha,
        pr_state: PrState["in_progress" as PrState],
        cluster_state: ClusterState["deleted"],
        config: ""
      });
      return "failed to find record or id not set";
    }

    cleanup(sha);
    const clusterId = record.cluster_id;

    try {
      const name = await getClusterName(clusterId);

      if (name instanceof Error){
        return false;
      }

      const balancer = await getLoadBalancer(name);

      if (balancer instanceof Error){
        return false;
      }

      const result = await deleteLoadBalancer(balancer.id);
      console.log(result);
    } catch (e) {
      console.log("delete load balancer");
      console.log(e.message);
    }

    await deleteCluster(clusterId);

    await saveReleaseToDB({
      refId,
      sha,
      cluster_id: null,
      pr_state: PrState["closed" as PrState],
      cluster_state: ClusterState["deleted"],
      config: ""
    });
  }

  return refId;
};
