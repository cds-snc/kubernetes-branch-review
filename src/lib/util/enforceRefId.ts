import { getRefId, returnStatus } from "../";
import { Request } from "../../interfaces/Request";
import { Response } from "express";

export const enforceRefId = (req: Request, res: Response) => {
  const body = req.body;
  const refId = getRefId(body);
  // do we have a refId?
  if (!refId) {
    let description = "no refId found 🛑";
    returnStatus(
      body,
      res,
      { state: "error", description },
      { state: "error", description }
    );

    throw new Error(description);
  }

  return refId;
};
