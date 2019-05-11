import { saveReleaseToDB, getRelease } from "../../db/queries";
import { createCluster, getConfig } from "../../api";
import { createDeployment } from "../../lib/githubNotify";
import { pollCluster } from "../../lib/pollCluster";
import { getRefId } from "../../lib/getRefId";
import { getName } from "../../lib/getName";
import { getAction } from "../../lib/getAction";
import { updateStatus } from "../../lib/githubStatus";
import { Request} from "../../interfaces/Request";
import { Release, PrState, ClusterState } from "../../interfaces/Release";

export const create = async (req: Request, release: Release) => {
  if (!req || !req.body) {
    throw new Error("invalid event passed");
  }
  const body = req.body;

  const refId = getRefId(body);

  if (!refId) {
    throw new Error("refId not defined");
  }

  const sha = release.sha;

  const prState = getAction(req);

  if (!sha || !prState) {
    throw new Error("sha or prState not defined");
  }

  try {
    await saveReleaseToDB({
      refId,
      sha,
      cluster_id: null,
      pr_state: PrState[prState as PrState],
      cluster_state: ClusterState["in_progress"]
    });

    // notify github
    const deployment = await createDeployment(body);

    // if this fails kill the process + update db
    const cluster = await createCluster({
      name: getName(req),
      version: "1.12.1-do.2"
    });

    if (cluster && cluster.kubernetes_cluster && cluster.kubernetes_cluster.id) {
      console.log("cluster created");
      console.log("polling cluster...");

      await updateStatus(
        body,
        { state: "pending", description: "Creating cluster ..." },
        refId
      );

      const result = await pollCluster(
        cluster.kubernetes_cluster.id,
        "running"
      );

      await updateStatus(
        body,
        { state: "pending", description: "Cluster deployed, building app ..." },
        refId
      );
      
      if (result){
        const id = result.kubernetes_cluster.id;
        const state = result.kubernetes_cluster.status.state;

        await saveReleaseToDB({
          refId,
          cluster_id: id,
          pr_state: PrState[prState as PrState],
          cluster_state: ClusterState[state as ClusterState],
          deployment_id: deployment.id
        });

        const config = await getConfig(id);

        // save config to the database
        await saveReleaseToDB({
          refId,
          config
        });
      }
    }

    return await getRelease({ refId });
  } catch (e) {
    console.log(e);
    console.log("err", e.message);
  }
};
