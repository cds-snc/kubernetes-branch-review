import { getRefId } from "../../lib/util/getRefId";
import { getRelease, saveReleaseToDB } from "../../db/queries";
import {
  updateDeploymentStatus,
  createDeployment
} from "../../lib/github/githubNotify";

import { getSha } from "../../lib/util/getSha";

import { Request } from "../../interfaces/Request";
import { Release } from "../../interfaces/Release";

export const update = async (req: Request): Promise<Release> => {
  const body = req.body;
  const refId = getRefId(body);

  if (refId) {
    let record = await getRelease({ refId });

    if (record) {
      await updateDeploymentStatus(
        body,
        { state: "inactive", description: "closed deployment" },
        refId
      );

      // create a new deployment
      const deployment = await createDeployment(body);

      const sha = getSha(body);

      await saveReleaseToDB({
        refId,
        deployment_id: deployment.id,
        sha
      });

      record = await getRelease({ refId });

      // set deployment to in progress
      await updateDeploymentStatus(
        body,
        { state: "in_progress", description: "updating deployment..." },
        refId
      );

      if (!record) {
        throw new Error("unable to set release");
      }

      return record;
    }
  }
};
