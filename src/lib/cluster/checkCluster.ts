import { deleteDropletByTag, getCluster } from "../../api";
import { getRefId } from "../util/getRefId";
import { getName } from "../util/getName";
import { getAction } from "../util/getAction";
import { create } from "../../events/create";
import { saveReleaseToDB } from "../../db/queries";
import { PrState, Release } from "../../interfaces/Release";
import { Request } from "../../interfaces/Request";

const handleCreate = async (req: Request, release: Release) => {
  const action = getAction(req);

  console.log(`handle create cluster ${action}`)

  if (action === "opened" || action === "updated" || action === "reopened") {
    // spin up a fresh cluster
    const result = await create(req, release);
    return result;
  }

  return release;
};

export const beforePr = async (req: Request): Promise<void> => {
  const refId = getRefId(req.body);
  if (refId) {
    await saveReleaseToDB({
      refId,
      sha: req.body.after,
      cluster_id: null,
      pr_state: PrState["none" as PrState]
    });
  }
};

const isClusterRunning = async (
  req: Request,
  release: Release,
  name: string
) => {
  // check to see if we have a cluster is in running state
  if (release && !release.cluster_id) {
    return release;
  }

  const data = await getCluster(release.cluster_id);

  if (
    data &&
    data.kubernetes_cluster &&
    data.kubernetes_cluster.state !== "running"
  ) {
    await deleteDropletByTag(name);
    const result = await handleCreate(req, release);
    return result;
  }

  return release;
};

export const checkAndCreateCluster = async (
  req: Request,
  release: Release | false
) => {
  
  const name = getName(req);

  if (!release || !release.refId) {
    return false;
  }

  if (!release.cluster_state || release.cluster_state === "deleted") {
    console.log("cluster or cluster state not found");
    const result = await handleCreate(req, release);
    return result;
  }

  // do some cleanup if we need to
  if (!release.cluster_id) {
    // destroy the droplet if no cluster id exists yet
    await deleteDropletByTag(name);
    const result = await handleCreate(req, release);
    return result;
  }

  const result = await isClusterRunning(req, release, name);
  return result;
};
