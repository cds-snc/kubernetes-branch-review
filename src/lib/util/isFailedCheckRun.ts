import { Request } from "../../interfaces";
import { updateDeploymentStatus } from "../index";

// @todo needs more testing
// this should set the deployment to inactive when tests etc... fail
export const isFailedCheckRun = async (
  req: Request,
  refId: string
): Promise<boolean> => {
  const body = req.body;

  if (
    body &&
    body.check_run &&
    body.check_run.conclusion &&
    body.check_run.conclusion === "failure"
  ) {
    const result = await updateDeploymentStatus(
      body,
      {
        state: "inactive",
        description: "failed checks",
        log_url: "",
        environment_url: ""
      },
      refId
    );

    console.log(result);
    return true;
  }

  return false;
};
