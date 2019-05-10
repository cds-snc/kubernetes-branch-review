import { deployRelease } from "./deployRelease";
import { returnStatus } from "./returnStatus";

import { Request } from "../interfaces/Request";
import { Release } from "../interfaces/Release";

const deployReleaseAndNotify = async (
  req: Request,
  refId: string,
  currentRelease: Release
) => {
  const body = req.body;

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
