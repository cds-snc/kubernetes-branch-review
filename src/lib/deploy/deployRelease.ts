import { saveIpAndUpdate } from "../loadBalancer/saveIp";
import { checkAndCreateCluster } from "../cluster/checkCluster";
import { update } from "../../events/update";
import { returnStatus } from "../util/returnStatus";
import { getRelease } from "../../db/queries";
import { noteError } from "../util/note";
import { checkoutAndUpdateContainers } from "./checkoutAndUpdateContainers";
import { Request } from "../../interfaces/Request";
import { Release } from "../../interfaces/Release";
import { Status } from "../../interfaces/Status";

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
    await checkoutAndUpdateContainers(await update(req));
    await saveIpAndUpdate(req, refId);
    return {
      state: "success",
      description: "Branch review app deployed"
    };
  }

  return false;
};

export const deployReleaseAndNotify = async (req: Request, refId: string) => {
  try {
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
  } catch (e) {
    noteError(`deploy ${e.message}`, e);
  }
};
