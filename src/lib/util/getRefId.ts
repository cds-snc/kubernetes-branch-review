import { isMaster } from "./isMaster";
import { RequestBody } from "../../interfaces";

const setFromEventRef = (event: RequestBody) => {
  const ref = event.ref.split("/");
  return ref[ref.length - 1];
};

const validateFields = (event: RequestBody) => {
  if (!event || !event.repository || !event.repository.full_name) {
    return false;
  }

  return true;
};

export const getRefId = (event: RequestBody): false | string => {
  let refId: false | string = false;

  if (!validateFields(event)) {
    return false;
  }

  const fullName = event.repository.full_name;

  if (event.action && event.action !== "completed") {
    refId = event.pull_request.head.ref;
  } else if (event.action && event.action === "completed") {
    refId = event.check_run.head_sha;
  } else if (event.ref && !isMaster(event)) {
    refId = setFromEventRef(event);
  }

  return refId ? `${fullName}/${refId}` : false;
};

export const getFullNameFromRefId = (refId: string): false | string => {
  if (!refId) return false;
  let ref = refId.split("/");
  ref.pop();
  return ref.join("/");
};
