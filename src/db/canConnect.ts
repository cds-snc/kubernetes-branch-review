import { dbConnect, returnStatus } from "../lib";
import { Request } from "../interfaces";
import { Response } from "express";

export const dbCanConnect = async (
  req: Request,
  res: Response
): Promise<boolean> => {
  const body = req.body;
  // do we have a database connection?
  const db = await dbConnect();
  if (!db) {
    let description = "database connection error 🛑";
    await returnStatus(
      body,
      res,
      {
        state: "error",
        description
      },
      {
        state: "error",
        description
      }
    );

    throw new Error(description);
  }

  return true;
};
