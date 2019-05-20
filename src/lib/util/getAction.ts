import { isMaster } from "./isMaster";
import { Request } from "../../interfaces/Request";

export const isBeforePr = (req: Request): boolean => {
  const body = req.body;
  if (
    body &&
    body.before &&
    body.before === "0000000000000000000000000000000000000000"
  ) {
    console.log("✅ commit prior to PR");
    return true;
  }

  return false;
};

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
