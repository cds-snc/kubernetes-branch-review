import { getRefId } from "../../lib/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import {
  updateDeploymentStatus,
  createDeployment
} from "../../lib/githubNotify";

export const update = async req => {
  const body = req.body;
  const sha = body.after;
  const refId = getRefId(body);
  let record = await getRelease({ refId });

  if (record) {
    await saveReleaseToDB({
      refId,
      sha
    });
    record = await getRelease({ refId });
  }

  // mark old deployment as inactive (just in case)
  // note: this should happen automatically in most cases when a status is updated
  // https://octokit.github.io/rest.js/#api-Repos-createDeploymentStatus

  await updateDeploymentStatus(
    body,
    { state: "inactive", description: "closed deployment" },
    refId
  );

  // create a new deployment
  const deployment = await createDeployment(body);

  await saveReleaseToDB({
    refId,
    deployment_id: deployment.id
  });

  // set deployment to in progress
  await updateDeploymentStatus(
    body,
    { state: "in_progress", description: "updating deployment..." },
    refId
  );

  return record;
};
