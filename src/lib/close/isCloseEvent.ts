import { getAction } from "../util/getAction";
import { returnStatus } from "../util/returnStatus";
import { close } from "./index";
import { Response } from "express";
import { Request } from "../../interfaces/Request";

const isClosingPush = (req: Request, res: Response) => {
  const body = req.body;

  // ignore closing push
  if (body.after && body.after === "0000000000000000000000000000000000000000") {
    returnStatus(
      body,
      res,
      {
        state: "success",
        description: "Closing push ignored"
      },
      {
        state: "inactive",
        description: "closed"
      }
    );

    return true;
  }

  return false;
};

const isClosedAction = async (req: Request, res: Response) => {
  const body = req.body;
  const action = getAction(req);
  // handle closed event
  if (action === "closed") {
    await close(req);
    returnStatus(
      body,
      res,
      {
        state: "success",
        description: "closed"
      },
      {
        state: "inactive",
        description: "closed"
      }
    );

    return true;
  }
};

export const isCloseEvent = async (req: Request, res: Response) => {
  const closePush = isClosingPush(req, res);
  const closedAction = await isClosedAction(req, res);

  if (closePush || closedAction) {
    res.send("closed");
    return true;
  }

  return false;
};
