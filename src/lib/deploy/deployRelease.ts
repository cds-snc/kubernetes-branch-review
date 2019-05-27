import { saveReleaseToDB, getRelease } from "../../db/queries";
import { checkAndCreateCluster } from "../cluster/checkCluster";
import { updateStatus } from "./updateStatus";
import {
  saveIpAndUpdate,
  noteError,
  returnStatus,
  getName,
  getAction,
  statusReporter,
  getClusterByName,
  ensureRefId
} from "../index";
import {
  PrState,
  ClusterState,
  StatusMessage,
  Request
} from "../../interfaces";
import { getConfig } from "../../api";
import { checkoutAndUpdateContainers } from "./checkoutAndUpdateContainers";
import { createDeployment } from "../github/githubNotify";

const parseData = async (
  req: Request
): Promise<{ refId: string; sha: string; prState: string }> => {
  const refId = ensureRefId(req);
  const release = await getRelease({ refId });

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

export const deployRelease = async (req: Request): Promise<StatusMessage> => {
  const { refId, prState } = await parseData(req);

  await startDeploy(req);
  await checkAndCreateCluster(req);
  await statusReporter(req, "Cluster deployed, building app...", "pending");
  await saveConfig(req, refId, prState);
  await statusReporter(
    req,
    "Cleanup + checking out updated code...",
    "pending"
  );
  await checkoutAndUpdateContainers(await updateStatus(req, refId));
  await saveIpAndUpdate(req, refId);
  return {
    state: "success",
    description: "Branch review deployed"
  };
};

export const deployReleaseAndNotify = async (req: Request, refId: string) => {
  try {
    const body = req.body;
    const result: StatusMessage = await deployRelease(req);

    if (result) {
      return returnStatus(body, null, result, result);
    }

    return returnStatus(
      body,
      null,
      {
        state: "error",
        description: "failed to deploy"
      },
      {
        state: "error",
        description: "failed to deploy"
      }
    );
  } catch (e) {
    noteError(`deploy ${e.message}`, e);
  }
};
