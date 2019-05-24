import { updateDeploymentStatus } from "../github/githubNotify";
import { updateStatus } from "../github/githubStatus";
import { getRefId } from "./getRefId";
import { RequestBody } from "../../interfaces/Request";
import { StatusMessage, DeploymentMessage } from "../../interfaces/Status";
import { Response } from "express";

export const returnStatus = async (
  body: RequestBody,
  res: Response | null,
  status: StatusMessage,
  deploymentStatus: DeploymentMessage
): Promise<void> => {
  const refId = getRefId(body);
  if (refId) {
    await updateDeploymentStatus(body, deploymentStatus, refId);
    await updateStatus(body, status, refId);
  }

  if (res) {
    console.log(status.description);
    res.send(status.description);
  }
};
