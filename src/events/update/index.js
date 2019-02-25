import { updateDeployment } from "../../lib/githubNotify";
import { getRelease, saveReleaseToDB } from "../../db/queries";

export const update = async req => {
  const body = req.body;
  const nodeId = body.repository.node_id;
  console.log("nodeId", nodeId);
  const model = await getRelease({ nodeId }, { nodeId: nodeId });
  console.log(model);
  return "hey";
  // const result = await updateDeployment(body);
};
