export const getRefId = event => {
  let refId;
  if (event && event.action) {
    refId = pull_request.head.ref;
  }

  return refId;
};
