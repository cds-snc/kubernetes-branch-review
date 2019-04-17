import { getCluster } from "../api";
import { getName } from "../lib/getName";
import { create } from "../events/create";

/*


{ id: '2b76872e-f8ba-4375-a2d5-658d2cecc047',
  name: 'cds-snc-etait-ici-no-merge',
  region: 'nyc1',
  version: '1.12.1-do.2',
  cluster_subnet: '10.244.0.0/16',
  service_subnet: '10.245.0.0/16',
  vpc_uuid: '8f4e31b9-caee-42d7-b22d-d78309998068',
  ipv4: '68.183.102.195',
  endpoint:
   'https://2b76872e-f8ba-4375-a2d5-658d2cecc047.k8s.ondigitalocean.com',
  tags:
   [ 'stage', 'k8s', 'k8s:2b76872e-f8ba-4375-a2d5-658d2cecc047' ],
  node_pools:
   [ { id: 'b31fc4f3-0031-44fb-8606-951cf439089d',
       name: 'frontend-pool',
       size: 's-1vcpu-2gb',
       count: 1,
       tags: [Array],
       nodes: [Array] } ],
  status: { state: 'running' },
  created_at: '2019-04-17T14:26:29Z',
  updated_at: '2019-04-17T14:29:55Z' }
*/

export const checkAndCreateCluster = async (req, release, action) => {
  if (!release || !release.cluster_state) {
    console.log("cluster or cluster state not found");
  }

  const body = req.body;

  const name = getName(req);

  if (action !== "opened" || action !== "updated") {
    return false;
  }

  const data = await getCluster(release.cluster_id);

  if (data && data.kubernetes_cluster) {
    if (data.kubernetes_cluster.state !== "running") {
      console.log("destroy");
      //get droplets
      //destroy ...
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
