import { updateDeploymentStatus } from "../lib/githubNotify";

export const returnStatus = async (body, res, status) => {
  await updateDeploymentStatus(body, status);
  res.send(status.description);
};
