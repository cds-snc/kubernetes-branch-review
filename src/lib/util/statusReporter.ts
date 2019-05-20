import { getRefId } from "./getRefId";
import { updateStatus } from "../github/githubStatus";
import { Request } from "../../interfaces/Request";

const pendingStatus = async (req: Request, message: string) => {
  const body = req.body;
  const refId = getRefId(body);
  if (!refId) return;
  await updateStatus(body, { state: "pending", description: message }, refId);
};

export const statusReporter = async (req: Request, msg: string) => {
  console.log(msg);
  await pendingStatus(req, msg);
};
