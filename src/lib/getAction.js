import { isMaster } from "./isMaster";
export const getAction = req => {
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
