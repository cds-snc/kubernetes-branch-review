import { getRefId } from "../../lib/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import { updateDeploymentStatus } from "../../lib/githubNotify";

export const update = async (req, release) => {
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

  await updateDeploymentStatus(
    req,
    { state: "in_progress", description: "updating deployment..." },
    refId
  );

  return record;
};
