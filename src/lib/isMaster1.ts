import { RequestBody } from "../interfaces/Request";

export const isMaster = (event: RequestBody) => {
  if (event && event.ref && event.ref.indexOf("master") !== -1) {
    return true;
  }

  return false;
};
