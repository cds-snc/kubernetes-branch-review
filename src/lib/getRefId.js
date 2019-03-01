import { isMaster } from "../lib/isMaster";

export const getRefId = event => {
  let refId = false;

  if (!event || !event.repository || !event.repository.full_name) {
    return false;
  }

  let fullName = event.repository.full_name;

  if (event && event.action) {
    refId = event.pull_request.head.ref;
  } else if (event && event.ref) {
    if (!isMaster(event)) {
      const ref = event.ref.split("/");
      refId = ref[ref.length - 1];
    }
  }

  if (!refId) {
    return false;
  }

  return `${fullName}/${refId}`;
};

export const getFullNameFromRefId = refId => {
  if (!refId) return false;
  let ref = refId.split("/");
  ref.pop();
  return ref.join("/");
};
