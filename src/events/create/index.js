import { saveReleaseToDB } from "../../db/queries";
import { createDeployment } from "../../lib/githubNotify";
import { createCluster } from "../../api";
import { pollCluster } from "../../lib/pollCluster";

export const create = async (req, res) => {
  const body = req.body;
  const refId = body.repository.full_name;
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

    await createDeployment(body);

    console.log("create cluster");
    const cluster = await createCluster();
    console.log(cluster);

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
        sha,
        cluster_id: id,
        pr_state: prState,
        cluster_state: state
      });
    }

    return "create";
  } catch (e) {
    console.log(e);
    console.log("err", e.message);
  }
};
