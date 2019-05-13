import { isMaster } from "../lib/isMaster";
import { RequestBody } from "../interfaces/Request";

const setFromEventRef = (event: RequestBody) => {
  const ref = event.ref.split("/");
  return ref[ref.length - 1];
};

export const getRefId = (event: RequestBody): false | string => {
  if (!event || !event.repository || !event.repository.full_name) {
    return false;
  }

  let refId: false | string = false;
  let fullName = event.repository.full_name;

  if (event.action) {
    refId = event.pull_request.head.ref;
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
