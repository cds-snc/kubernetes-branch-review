import { getRefId } from "../../lib/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import { deleteCluster } from "../../api";

export const close = async req => {
  const body = req.body;
  const refId = getRefId(body);
  const record = await getRelease({ refId });

  if (!record || record.cluster_id) {
    return "failed to find record or id not set";
  }

  const result = await deleteCluster(record.cluster_id);
  console.log("delete cluster");
  console.log(result);

  await saveReleaseToDB({
    refId,
    sha: null,
    cluster_id: null,
    pr_state: "closed",
    cluster_state: "deleted"
  });

  return refId;
};
