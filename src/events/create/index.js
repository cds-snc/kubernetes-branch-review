import { saveReleaseToDB, getRelease } from "../../db/queries";
import { createCluster, getConfig } from "../../api";
import { createDeployment } from "../../lib/githubNotify";
import { pollCluster } from "../../lib/pollCluster";
import { getRefId } from "../../lib/getRefId";
import { getName } from "../../lib/getName";
import { getAction } from "../../lib/getAction";
import { updateStatus } from "../../lib/githubStatus";

export const create = async (req, release) => {
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
      pr_state: prState,
      cluster_state: "in_progress"
    });

    // notify github
    const deployment = await createDeployment(body);

    // if this fails kill the process + update db

    console.log("create cluster");
    const cluster = await createCluster({
      name: getName(req),
      version: "1.12.1-do.2"
    });

    if (cluster.kubernetes_cluster && cluster.kubernetes_cluster.id) {
      console.log("cluster created");
      console.log("polling cluster...");

      await updateStatus(body, "Creating cluster ...", refId);

      const result = await pollCluster(
        cluster.kubernetes_cluster.id,
        "running"
      );

      await updateStatus(body, "Cluster deployed", refId);

      const id = result.kubernetes_cluster.id;
      const state = result.kubernetes_cluster.status.state;

      await saveReleaseToDB({
        refId,
        cluster_id: id,
        pr_state: prState,
        cluster_state: state,
        deployment_id: deployment.id
      });

      const config = await getConfig(id);

      // save config to the database
      await saveReleaseToDB({
        refId,
        config
      });
    }

    return await getRelease({ refId });
  } catch (e) {
    console.log(e);
    console.log("err", e.message);
  }
};
