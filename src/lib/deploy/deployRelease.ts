import { saveIpAndUpdate } from "../loadBalancer/saveIp";
import { saveReleaseToDB, getRelease } from "../../db/queries";
import { checkAndCreateCluster } from "../cluster/checkCluster";
import { update } from "../../events/update";
import { returnStatus } from "../util/returnStatus";
import { noteError } from "../util/note";
import { getName } from "../util/getName";
import { checkoutAndUpdateContainers } from "./checkoutAndUpdateContainers";
import { Request } from "../../interfaces/Request";
import { Status } from "../../interfaces/Status";
import { getConfig } from "../../api";
import { PrState, ClusterState } from "../../interfaces/Release";
import { getRefId } from "../../lib/util/getRefId";
import { getAction } from "../../lib/util/getAction";
import { statusReporter } from "../../lib/util/statusReporter";
import { getClusterByName } from "../cluster/checkCluster";
import { createDeployment } from "../github/githubNotify";

const parseData = async (
  req: Request
): Promise<{ refId: string; sha: string; prState: string }> => {
  if (!req || !req.body) {
    throw new Error("invalid event passed");
  }
  const body = req.body;
  const refId = getRefId(body);

  if (!refId) {
    throw new Error("refId not defined");
  }

  let release = await getRelease({ refId });

  if (!release || !release.sha) {
    throw new Error("release not found");
  }

  const sha = release.sha;
  const prState = getAction(req);

  if (!sha || !prState) {
    throw new Error("sha or prState not defined");
  }

  return { refId, sha, prState };
};

const startDeploy = async (req: Request) => {
  const { refId, sha, prState } = await parseData(req);

  await saveReleaseToDB({
    refId,
    sha,
    cluster_id: null,
    pr_state: PrState[prState as PrState],
    cluster_state: ClusterState["in_progress"]
  });
};

const saveConfig = async (req: Request, refId: string, prState: string) => {
  const deployment = await createDeployment(req.body);
  const name = getName(req);
  const cluster = await getClusterByName(name);

  if (cluster && cluster.id) {
    const id = cluster.id;
    const state = cluster.status.state;

    await saveReleaseToDB({
      refId,
      cluster_id: id,
      pr_state: PrState[prState as PrState],
      cluster_state: ClusterState[state as ClusterState],
      deployment_id: deployment.id
    });

    const config = await getConfig(id);

    // save config to the database
    await saveReleaseToDB({
      refId,
      config
    });
  }
};

export const deployRelease = async (
  req: Request
): Promise<Status | boolean> => {
  const { refId, prState } = await parseData(req);

  await startDeploy(req);
  await checkAndCreateCluster(req);
  await statusReporter(req, "Cluster deployed, building app ...");
  await saveConfig(req, refId, prState);
  await checkoutAndUpdateContainers(await update(req));
  await saveIpAndUpdate(req, refId);
  return {
    state: "success",
    description: "Branch review app deployed"
  };
};

export const deployReleaseAndNotify = async (req: Request, refId: string) => {
  try {
    const body = req.body;

    const deployStatus = await deployRelease(req);

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