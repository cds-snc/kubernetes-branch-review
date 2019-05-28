import { Request } from "../../interfaces";
import { updateDeploymentStatus } from "../index";
export const isFailedCheckRun = async (
  req: Request,
  refId: string
): Promise<boolean> => {
  const body = req.body;
  await updateDeploymentStatus(
    body,
    { state: "inactive", description: "failed checks" },
    refId
  );
  return true;
};
