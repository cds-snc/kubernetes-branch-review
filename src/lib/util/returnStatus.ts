import { updateDeploymentStatus } from "../github/githubNotify";
import { updateStatus } from "../github/githubStatus";
import { getRefId } from "./getRefId";
import { RequestBody } from "../../interfaces/Request";
import { Status } from "../../interfaces/Status";
import { Response } from "express";

export const returnStatus = async (
  body: RequestBody,
  res: Response | null,
  status: Status
): Promise<void> => {
  const refId = getRefId(body);
  if (refId) {
    await updateDeploymentStatus(body, status, refId);
    await updateStatus(body, status, refId);
  }

  if (res) {
    console.log(status.description);
    res.send(status.description);
  }
};
