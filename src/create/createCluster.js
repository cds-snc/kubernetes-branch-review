import { saveReleaseToDB } from "../db/queries";
import { createDeployment } from "../lib/githubNotify";
import { createCluster, deleteCluster } from "../api";
import { pollCluster } from "../lib/pollCluster";

export const create = async (req, res) => {
  const body = req.body;

  try {
    await saveReleaseToDB({
      sha: body.pull_request.head.sha,
      cluster_id: null,
      pr_state: body.action,
      cluster_state: "in_progress"
    });

    await createDeployment(req.body);
    /*
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

      console.log("delete cluster", id);
      console.log("delete result", await deleteCluster(id));
    }
    */

    return ":)";
  } catch (e) {
    console.log(e);
    console.log("err", e.message);
  }
};
