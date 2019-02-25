import { isMaster } from "../lib/isMaster";
export const getRefId = event => {
  let refId = false;
  if (event && event.action) {
    refId = event.pull_request.head.ref;
  } else if (event && event.ref) {
    if (!isMaster(event)) {
      const ref = event.ref.split("/");
      refId = ref[ref.length - 1];
    }
  }

  return refId;
};
