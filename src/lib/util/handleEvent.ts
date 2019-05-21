import { Request } from "../../interfaces/Request";
export const handleEvent = (
  req: Request
): { handleEvent: boolean; type: string } => {
  let event = "not-found";
  let handleEvent = false;

  try {
    event = req.header("X-GitHub-Event");
  } catch (e) {
    console.log("headerEvent not found");
  }

  const safeList = ["create", "push", "delete", "pull_request"];

  if (safeList.includes(event)) {
    console.log(`✅ allow - ${event}`);
    handleEvent = true;
  }

  return { handleEvent, type: event };
};
