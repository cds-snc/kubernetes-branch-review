import { updateDeployment } from "../lib/githubNotify";

export const update = async (req, res) => {
  const body = req.body;
  const result = await updateDeployment(body);
  console.log(result);
};
