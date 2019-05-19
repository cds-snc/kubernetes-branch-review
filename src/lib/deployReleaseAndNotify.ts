import { deployRelease } from "./deployRelease";
import { returnStatus } from "./returnStatus";

import { Request } from "../interfaces/Request";
import { getRelease } from "../db/queries";

const deployReleaseAndNotify = async (req: Request, refId: string) => {
  const body = req.body;

  let currentRelease = await getRelease({ refId });

  const deployStatus = await deployRelease(req, refId, currentRelease);

  if (deployStatus && typeof deployStatus === "object") {
    return returnStatus(body, null, deployStatus);
  }

  return returnStatus(body, null, {
    state: "error",
    description: "no release found"
  });
};

module.exports.deployReleaseAndNotify = deployReleaseAndNotify;
