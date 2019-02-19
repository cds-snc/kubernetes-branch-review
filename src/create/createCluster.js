import { saveReleaseToDB } from "../db/queries";
import { createDeployment } from "../lib/githubNotify";

export const createCluster = async (req, res) => {
  const body = req.body;

  try {
    await saveReleaseToDB({
      sha: body.pull_request.head.sha,
      cluster_id: null,
      pr_state: body.action,
      cluster_state: "in_progress"
    });

    const result = await createDeployment(req.body);
    // api call to digital ocean ...
    return result;
  } catch (e) {
    console.log("err", e.message);
  }
};
