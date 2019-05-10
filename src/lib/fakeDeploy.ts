import { getAction } from "./getAction";
import { Request } from "../interfaces/Request";
import { Release } from "../interfaces/Release";

const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const fakeDeploy = async (
  req: Request,
  refId: string,
  currentRelease: Release
) => {
  await sleep(5000);
  console.log("hello");
  console.log(req);
  console.log(refId);
  const test = getAction(req);
  console.log(test);
};
