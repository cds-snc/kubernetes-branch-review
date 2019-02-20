import { saveReleaseToDB } from "../db/queries";
// import { createDeployment } from "../lib/githubNotify";
import { create } from "../api";

export const createCluster = async (req, res) => {
  const body = req.body;

  try {
    await saveReleaseToDB({
      sha: body.pull_request.head.sha,
      cluster_id: null,
      pr_state: body.action,
      cluster_state: "in_progress"
    });

    // const result = await createDeployment(req.body);
    create();
    const result = "hello";

    // api call to digital ocean ...
    return result;
  } catch (e) {
    console.log(e);
    console.log("err", e.message);
  }
};
