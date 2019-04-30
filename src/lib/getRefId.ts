import { isMaster } from "../lib/isMaster";
import { RequestBody } from "../interfaces/Request";

export const getRefId = (event:RequestBody): false|string => {
  let refId:string;

  if (!event || !event.repository || !event.repository.full_name) {
    return false;
  }

  let fullName = event.repository.full_name;

  if (event && event.action) {
    refId = event.pull_request.head.ref;
  } else if (event && event.ref) {
    if (!isMaster(event))event {
      const ref = event.ref.split("/");
      refId = ref[ref.length - 1];
    }
  }

  if (!refId) {
    return false;
  }

  return `${fullName}/${refId}`;
};

export const getFullNameFromRefId = (refId:string): false|string => {
  if (!refId) return false;
  let ref = refId.split("/");
  ref.pop();
  return ref.join("/");
};
