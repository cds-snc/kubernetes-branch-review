import { getRefId } from "../../lib/getRefId";
import { updateDeployment } from "../../lib/githubNotify";
import { getRelease, saveReleaseToDB } from "../../db/queries";

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

  await updateDeployment(body, sha);
  return record;
};
