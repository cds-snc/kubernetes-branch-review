import { getRefId } from "../lib/getRefId";

export const getName = req => {
  const body = req.body;

  const refId = getRefId(body);

  if (!refId) {
    throw new Error("refId not defined");
  }
  const name = refId.replace(/\//g, "-").replace(/_/g, "-");
  return name;
};
