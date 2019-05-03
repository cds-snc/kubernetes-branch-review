import { getRefId } from "../../lib/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import {
  updateDeploymentStatus,
  createDeployment
} from "../../lib/githubNotify";
import { Request } from "../../interfaces/Request";
import { Release } from "../../interfaces/Release";

export const update = async (req: Request): Promise<Release> => {
  const body = req.body;
  const refId = getRefId(body);

  if (refId){

    let record = await getRelease({ refId });

    if (record) {

      await updateDeploymentStatus(
        body,
        { state: "inactive", description: "closed deployment" },
        refId
      );

      // create a new deployment
      const deployment = await createDeployment(body);

      await saveReleaseToDB({
        refId,
        deployment_id: deployment.id
      });

      // set deployment to in progress
      await updateDeploymentStatus(
        body,
        { state: "in_progress", description: "updating deployment..." },
        refId
      );

      return record;
      }
  }
};
