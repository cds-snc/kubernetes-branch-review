import fetch from "node-fetch";

const baseUrl = "https://api.digitalocean.com/v2/kubernetes";
const { K8_API_KEY: TOKEN } = process.env;

/*

{ kubernetes_cluster:
   { id: '9ebfa638-697f-4c2f-9c1a-b2c991524e9d',
     name: 'stage-cluster-01',
     region: 'nyc1',
     version: '1.12.1-do.2',
     cluster_subnet: '10.244.0.0/16',
     service_subnet: '10.245.0.0/16',
     ipv4: '',
     endpoint: '',
     tags:
      [ 'stage', 'k8s', 'k8s:9ebfa638-697f-4c2f-9c1a-b2c991524e9d' ],
     node_pools: [ [Object] ],
     status: { state: 'provisioning', message: 'provisioning' },
     created_at: '2019-02-20T14:21:54Z',
     updated_at: '2019-02-20T14:21:54Z' } }
*/

export const create = () => {
  const endpoint = `${baseUrl}/clusters`;

  const body = {
    name: "stage-cluster-01",
    region: "nyc1",
    version: "1.12.1-do.2",
    tags: ["stage"],
    node_pools: [
      {
        size: "s-1vcpu-2gb",
        count: 1,
        name: "frontend-pool",
        tags: ["frontend"]
      }
    ]
  };
  fetch(endpoint, {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  })
    .then(res => res.json())
    .then(json => console.log(json));
};
