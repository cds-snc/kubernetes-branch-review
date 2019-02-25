import { saveReleaseToDB } from "../../db/queries";
import { createCluster } from "../../api";
import { createDeployment } from "../../lib/githubNotify";
import { pollCluster } from "../../lib/pollCluster";
import { getRefId } from "../../lib/getRefId";

export const create = async req => {
  const body = req.body;
  const refId = getRefId(body);
  const sha = body.pull_request.head.sha;
  const prState = body.action;

  try {
    await saveReleaseToDB({
      refId,
      sha,
      cluster_id: null,
      pr_state: prState,
      cluster_state: "in_progress"
    });

    /* 
    @todo - thinking this should be split out as it's a long running task and the response resonds too slowly
    */

    // notify github
    await createDeployment(body);

    console.log("create cluster");
    const cluster = await createCluster();

    if (cluster.kubernetes_cluster && cluster.kubernetes_cluster.id) {
      console.log("cluster created");
      console.log("poll if cluster is running...");
      const result = await pollCluster(
        cluster.kubernetes_cluster.id,
        "running"
      );

      const id = result.kubernetes_cluster.id;
      const state = result.kubernetes_cluster.status.state;

      await saveReleaseToDB({
        refId,
        cluster_id: id,
        pr_state: prState,
        cluster_state: state
      });
    }

    return cluster;
  } catch (e) {
    console.log(e);
    console.log("err", e.message);
  }
};
