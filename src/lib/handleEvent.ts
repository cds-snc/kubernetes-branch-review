import { Request } from "../interfaces/Request";
export const handleEvent = (req: Request): boolean => {
  let headerEvent = "";

  try {
    headerEvent = req.header("X-GitHub-Event");
  } catch (e) {
    console.log("headerEvent not found");
  }

  const ignore = ["completed", "status", "deployment_status", "deployment"];

  if (ignore.includes(headerEvent)) {
    return false;
  }

  return true;
};
