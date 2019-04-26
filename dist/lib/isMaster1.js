export const isMaster = event => {
  if (event && event.ref && event.ref.indexOf("master") !== -1) {
    return true;
  }
  return false;
};
