import { getDroplets, getLoadBalancers, getCluster } from "../api";
import { Droplet } from "../interfaces/Droplet";
import { LoadBalancer } from "../interfaces/LoadBalancer";

export const getDropletByName = async (name:string): Promise<false|Droplet> => {
  const result = await getDroplets();

  let clusterDroplet:false|Droplet
  clusterDroplet = false;

  if (result) {
    result.droplets.forEach((droplet:Droplet): void => {
      if (droplet.name === name) {
        clusterDroplet = droplet;
      }
    });
  }

  return clusterDroplet;
};

export const getLoadBalancerById = async (id:number): Promise<LoadBalancer> => {
  const result = await getLoadBalancers();

  let clusterLoadBalancer:LoadBalancer

  if (result) {
    result.load_balancers.forEach((loadBalancer:LoadBalancer) => {
      let ids = loadBalancer.droplet_ids;

      if (ids && ids.length >= 1 && ids.includes(id)) {
        clusterLoadBalancer = loadBalancer;
      }
    });
  }

  return clusterLoadBalancer;
};

export const getLoadBalancer = async (name:string): Promise<Error|LoadBalancer> => {
  const droplet = await getDropletByName(name);
  if (!droplet || !droplet.id) {
    throw new Error(`droplet not found ${name}`);
  }
  const balancer = await getLoadBalancerById(droplet.id);
  return balancer;
};

export const getClusterName = async (clusterId:string): Promise<Error|string>=> {
  const cluster = await getCluster(clusterId);
  if (
    !cluster ||
    !cluster.kubernetes_cluster ||
    !cluster.kubernetes_cluster.node_pools
  ) {
    throw new Error(`Cluster not found ${clusterId}`);
  }

  const name = cluster.kubernetes_cluster.node_pools[0].nodes[0].name;
  return name;
};

export const getLoadBalancerIp = async (clusterId:string): Promise<false|string> => {
  const name = await getClusterName(clusterId);

  if (name instanceof Error) {
    return false;
  }

  const balancer = await getLoadBalancer(name);

  if (balancer instanceof Error) {
    return false;
  }

  if (balancer && balancer.id && balancer.ip) {
    console.log("ip", balancer.ip);
    return balancer.ip;
  }
  

  return false;
};
