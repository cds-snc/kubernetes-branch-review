import { saveReleaseToDB, getRelease } from "../../db/queries";
import { createCluster, getConfig } from "../../api";
import { createDeployment } from "../../lib/github/githubNotify";
import { pollCluster } from "../../lib/cluster/pollCluster";
import { getRefId } from "../../lib/util/getRefId";
import { getName } from "../../lib/util/getName";
import { getAction } from "../../lib/util/getAction";
import { Request } from "../../interfaces/Request";
import { Cluster } from "../../interfaces/Cluster";
import { Release, PrState, ClusterState } from "../../interfaces/Release";
import { statusReporter } from "../../lib/util/statusReporter";

const parseData = (req: Request, release: Release) => {
  if (!req || !req.body) {
    throw new Error("invalid event passed");
  }
  const body = req.body;
  const refId = getRefId(body);

  if (!refId) {
    throw new Error("refId not defined");
  }

  const sha = release.sha;
  const prState = getAction(req);

  if (!sha || !prState) {
    throw new Error("sha or prState not defined");
  }

  return { refId, sha, prState };
};

const saveConfig = async (
  result: void | { kubernetes_cluster: Cluster },
  deployment: { id: string },
  refId: string,
  prState: string
) => {
  if (result) {
    const id = result.kubernetes_cluster.id;
    const state = result.kubernetes_cluster.status.state;

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

const startCreate = async (req: Request, release: Release) => {
  const { refId, sha, prState } = parseData(req, release);

  await saveReleaseToDB({
    refId,
    sha,
    cluster_id: null,
    pr_state: PrState[prState as PrState],
    cluster_state: ClusterState["in_progress"]
  });
};

const checkCluster = async (
  req: Request,
  release: Release,
  deployment: { id: string }
): Promise<void> => {
  
  const { refId, prState } = parseData(req, release);
  // if this fails kill the process + update db

  const clusterName = getName(req);

  // note: the version get change pull from api get options
  const cluster = await createCluster({
    name: clusterName,
    version: "1.14.2-do.0"
  });

  if (cluster && cluster.kubernetes_cluster && cluster.kubernetes_cluster.id) {
    await statusReporter(req, "cluster created - start provisioning");

    const result = await pollCluster(
      cluster.kubernetes_cluster.id,
      "running",
      async (msg: string) => {
        await statusReporter(req, msg);
      }
    );

    await statusReporter(req, "Cluster deployed, building app ...");
    await saveConfig(result, deployment, refId, prState);
  }
};

export const create = async (req: Request, release: Release) => {
  const body = req.body;
  const { refId } = parseData(req, release);

  if (!refId) return;

  await startCreate(req, release);
  // notify github
  const deployment = await createDeployment(body);
  await checkCluster(req, release, deployment);
  return await getRelease({ refId });
};
