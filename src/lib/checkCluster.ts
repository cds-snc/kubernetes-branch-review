import { deleteDropletByTag, getCluster } from "../api";
import { getRefId } from "../lib/getRefId";
import { getName } from "../lib/getName";
import { getAction } from "../lib/getAction";
import { create } from "../events/create";
import { saveReleaseToDB } from "../db/queries";
import { Release } from "../interfaces/Release";
import { Request } from "../interfaces/Request";

const handleCreate = async (req: Request, release: Release) => {
  const action = getAction(req);
  if (action === "opened" || action === "updated" || action === "reopened") {
    // spin up a fresh cluster
    const result = await create(req, release);
    return result;
  }

  return release;
};

export const checkAndCreateCluster = async (req: Request, release: Release) => {
  const name = getName(req);

  if (!release || !release.refId) {
    const refId = getRefId(req.body);
    if (refId){
      await saveReleaseToDB({
        refId,
        sha: req.body.after,
        cluster_id: null,
        pr_state: "none"
      });
    }

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
  } else {
    // check to see if we have a cluster is in running state
    const data = await getCluster(release.cluster_id);

    if (
      data &&
      data.kubernetes_cluster &&
      data.kubernetes_cluster.state !== "running"
    ) {
      await deleteDropletByTag(name);
      const result = await handleCreate(req, release);
      return result;
    } else {
      return release;
    }
  }
};
