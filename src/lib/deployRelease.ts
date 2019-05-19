import { saveIpAndUpdate } from "./saveIp";
import { checkAndCreateCluster } from "./checkCluster";
import { update } from "../events/update";
import { deploy } from "./deploy";
import { Request } from "../interfaces/Request";
import { Release } from "../interfaces/Release";
import { Status } from "../interfaces/Status";

export const deployRelease = async (
  req: Request,
  refId: string,
  currentRelease: Release | false
): Promise<Status | boolean> => {

  let release: Release | false = await checkAndCreateCluster(
    req,
    currentRelease
  );

  if (release && release.refId) {
    await deploy(await update(req));

    await saveIpAndUpdate(req, refId);
    return {
      state: "success",
      description: "Branch review app deployed"
    };
  }

  return false;
};

module.exports.deployRelease = deployRelease;
