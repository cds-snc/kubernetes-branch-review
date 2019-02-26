import { getRefId } from "../../lib/getRefId";
import { updateDeployment } from "../../lib/githubNotify";
import { getRelease, saveReleaseToDB } from "../../db/queries";

export const update = async req => {
  const body = req.body;
  const sha = body.after;
  const refId = getRefId(body);
  const record = await getRelease({ refId });

  if (record) {
    await saveReleaseToDB({
      refId,
      sha
    });
  }

  const result = await updateDeployment(body, sha);
  return result;
};
