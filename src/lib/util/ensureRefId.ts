import { getRefId } from "../";
import { Request } from "../../interfaces";

export const ensureRefId = (req: Request) => {
  if (!req || !req.body) {
    throw new Error("invalid event passed");
  }

  const refId = getRefId(req.body);

  if (!refId) {
    throw new Error("refId not defined");
  }

  return refId;
};
