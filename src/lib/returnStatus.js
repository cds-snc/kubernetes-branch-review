import { updateDeploymentStatus } from "../lib/githubNotify";
import { updateStatus } from "../lib/githubStatus";
import { getRefId } from "../lib/getRefId";

export const returnStatus = async (body, res, status) => {
  const refId = getRefId(body);
  await updateDeploymentStatus(body, status, refId);
  await updateStatus(body, status, refId);
  res.send(status.description);
};
