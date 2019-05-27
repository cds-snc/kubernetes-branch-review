import { saveReleaseToDB, getRelease, getDeployment } from "../../db/queries";
import { updateDeploymentStatus } from "../github/githubNotify";

import { getSha } from "../util/getSha";
import { Request, Release } from "../../interfaces";

export const updateStatus = async (
  req: Request,
  refId: string
): Promise<Release> => {
  const body = req.body;

  const deployment = await getDeployment({ refId: refId });

  if (!deployment) {
    throw new Error("deployment not found");
  }

  await saveReleaseToDB({
    refId,
    deployment_id: deployment.deployment_id,
    sha: getSha(body)
  });

  // set deployment to in progress
  await updateDeploymentStatus(
    body,
    { state: "in_progress", description: "updating deployment..." },
    refId
  );

  // get the latest release here
  // note getRelease appends fullName (required for git checkout)
  const record = await getRelease({ refId });

  if (!record) {
    throw new Error("unable to set release");
  }

  return record;
};
