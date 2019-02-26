import { updateDeployment } from "../../lib/githubNotify";
import { getRelease } from "../../db/queries";

export const update = async req => {
  const body = req.body;

  const refId = getRefId(body);
  //const record = await getRelease({ refId });
  //const result = await updateDeployment(body);
};
