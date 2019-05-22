import { isMaster } from "./isMaster";
import { Request } from "../../interfaces/Request";
import { isBeforePr } from "../util/beforePr";

// @todo - update return type with possible values
export const getAction = (req: Request): string => {
  let action;
  const body = req.body;

  if (body && body.action) {
    // create
    // close
    // reopen
    action = body.action;
  } else if (!isMaster(body) && body.repository) {
    action = "updated";
  } else if (isBeforePr(req)) {
    action = "init";
  }

  return action;
};
