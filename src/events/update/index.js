import { updateDeployment } from "../../lib/githubNotify";

export const update = async (req, res) => {
  const body = req.body;
  // "ref": "refs/heads/elenchos_demo",
  const result = await updateDeployment(body);

  // tell db new sha

  // kick to step 2 to redeploy
  console.log(result);
};
