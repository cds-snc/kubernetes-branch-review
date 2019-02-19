import { saveReleaseToDB } from "../db/queries";
import { createDeployment } from "../lib/githubNotify";

export const createCluster = async (req, res) => {
  try {
    await saveReleaseToDB({
      sha: "123",
      cluster_id: "2",
      pr_state: "closed",
      cluster_state: "in_progress"
    });

    const result = await createDeployment(req.body);
    // api call to digital ocean ...
    return result;
  } catch (e) {
    console.log(e.message);
  }
};
