import { saveReleaseToDB } from "../../db/queries";
import {
  updateDeploymentStatus,
  createDeployment
} from "../github/githubNotify";

import { getSha } from "../util/getSha";
import { Request } from "../../interfaces/Request";
import { Release } from "../../interfaces/Release";

export const updateStatus = async (
  req: Request,
  refId: string
): Promise<Release> => {
  const body = req.body;

  await updateDeploymentStatus(
    body,
    { state: "inactive", description: "closed deployment" },
    refId
  );

  const deployment = await createDeployment(body);
  const record = await saveReleaseToDB({
    refId,
    deployment_id: deployment.id,
    sha: getSha(body)
  });

  // set deployment to in progress
  await updateDeploymentStatus(
    body,
    { state: "in_progress", description: "updating deployment..." },
    refId
  );

  if (!record) {
    throw new Error("unable to set release");
  }

  return record;
};
