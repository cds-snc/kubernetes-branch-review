import { isMaster } from "./isMaster1";
import { Request } from "../interfaces/Request";

export const getAction = (req: Request) => {
  let action;
  const body = req.body;

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
