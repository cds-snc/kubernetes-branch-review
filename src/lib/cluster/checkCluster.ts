import { getAllClusters, createCluster } from "../../api";
import { pollCluster } from "./pollCluster";
import { statusReporter, getName } from "../../lib";
import { Request, Cluster } from "../../interfaces";

const waitForProvisioningCluster = async (req: Request, clusterId: string) => {
  const data = await pollCluster(clusterId, "running", async (msg: string) => {
    // update github
    await statusReporter(req, msg, "pending");
  });

  if (data && data.kubernetes_cluster.state === "running") {
    return data;
  }

  return data;
};

export const createClusterAndWait = async (req: Request) => {
  const clusterName = getName(req);

  // make the api call
  const cluster = await createCluster({
    name: clusterName,
    version: "1.14.2-do.0"
  });

  if (cluster && cluster.kubernetes_cluster && cluster.kubernetes_cluster.id) {
    const result = await waitForProvisioningCluster(
      req,
      cluster.kubernetes_cluster.id
    );

    return result;
  }

  throw new Error("failed to create cluster");
};

export const getClusterByName = async (
  name: string
): Promise<false | Cluster> => {
  const result = await getAllClusters();

  let found: false | Cluster;
  found = false;

  if (result && result.kubernetes_clusters) {
    result.kubernetes_clusters.forEach(
      (cluster: Cluster): void => {
        if (cluster.name === name) {
          found = cluster;
        }
      }
    );
  }

  return found;
};

// checks to see if we have an existing cluster and if it's in a running state
export const clusterExists = async (req: Request): Promise<boolean> => {
  const name = getName(req);
  const cluster = await getClusterByName(name);

  if (!cluster || !cluster.id || !cluster.status) return false;

  if (cluster.status.state === "provisioning") {
    console.log("found a cluster in a provisioning state...");
    const result = await waitForProvisioningCluster(req, cluster.id);
    console.log(result);
    return true;
  }

  if (cluster.status.state === "running") {
    return true;
  }

  return false;
};

export const checkAndCreateCluster = async (req: Request): Promise<void> => {
  let result = await clusterExists(req);

  if (!result) {
    await createClusterAndWait(req);
  }
};
