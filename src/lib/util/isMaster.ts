import { RequestBody } from "../../interfaces";

export const isMaster = (event: RequestBody): boolean => {
  return event && event.ref && event.ref.indexOf("master") !== -1;
};
