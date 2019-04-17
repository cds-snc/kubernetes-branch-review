import { getCluster, getDroplets } from "../api";
import { getName } from "../lib/getName";
import { create } from "../events/create";

export const checkAndCreateCluster = async (req, release, action) => {
  if (!release || !release.cluster_state) {
    console.log("cluster or cluster state not found");
  }

  const name = getName(req);

  if (action !== "opened" || action !== "updated") {
    return false;
  }

  const data = await getCluster(release.cluster_id);

  if (data && data.kubernetes_cluster) {
    if (data.kubernetes_cluster.state !== "running") {
      console.log("destroy droplet", name);
      const droplets = await getDroplets();
      console.log(droplets);
      // get droplets
      // destroy ...
    }
  }

  if (action === "opened" || action === "updated") {
    if (data.kubernetes_cluster.state === "running") {
      console.log("already running");
      return release;
    }

    const result = await create(req, release);
    return result;
  }

  return release;
};
