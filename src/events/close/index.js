import { getRefId } from "../../lib/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import { deleteCluster } from "../../api";

export const close = async (req, release) => {
  const body = req.body;
  const sha = body.pull_request.head.sha;
  const refId = getRefId(body);
  const record = await getRelease({ refId });

  if (!record || !record.cluster_id) {
    await saveReleaseToDB({
      refId,
      sha,
      pr_state: "closed",
      cluster_state: "deleted",
      config: ""
    });
    return "failed to find record or id not set";
  }

  const result = await deleteCluster(record.cluster_id);
  console.log("delete cluster");
  console.log(result);

  await saveReleaseToDB({
    refId,
    sha,
    cluster_id: null,
    pr_state: "closed",
    cluster_state: "deleted",
    config: ""
  });

  return refId;
};
