export const isMaster = event => {
  return event && event.ref && event.ref.indexOf("master") !== -1;
};
