import { isMaster } from "./isMaster";
import { Request } from "../interfaces/Request";

// @todo - update return type with possible values
export const getAction = (req: Request): string => {
  let action;
  const body = req.body;

  if (
    body &&
    body.before &&
    body.before === "0000000000000000000000000000000000000000"
  ) {
    console.log("✅ initial commit");
  }

  if (body && body.action) {
    // create
    // close
    // reopen
    action = body.action;
  } else {
    // get action from other type of event
    if (!isMaster(body) && body.repository) {
      action = "updated";
    }
  }
  return action;
};
