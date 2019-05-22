import { dbConnect } from "./connect";
import { returnStatus } from "../lib/util/returnStatus";
import { Request } from "../interfaces/Request";
import { Response } from "express";

export const canConnect = async (
  req: Request,
  res: Response
): Promise<boolean> => {
  const body = req.body;
  // do we have a database connection?
  const db = await dbConnect();
  if (!db) {
    let status = "database connection error 🛑";
    await returnStatus(body, res, {
      state: "error",
      description: status
    });

    return false;
  }

  return true;
};
