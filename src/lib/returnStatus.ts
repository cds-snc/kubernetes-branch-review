import { updateDeploymentStatus } from "../lib/githubNotify";
import { updateStatus } from "../lib/githubStatus";
import { getRefId } from "../lib/getRefId";
import { RequestBody } from "../interfaces/Request";
import { Status } from "../interfaces/Status";
import { Response } from "express";

export const returnStatus = async (
  body: RequestBody,
  res: Response,
  status: Status
): Promise<void> => {
  const refId = getRefId(body);
  if(refId){
    await updateDeploymentStatus(body, status, refId);
    await updateStatus(body, status, refId);
  }
  res.send(status.description);
};
