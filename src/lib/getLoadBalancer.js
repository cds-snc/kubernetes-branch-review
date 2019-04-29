import { getDroplets, getLoadBalancers, getCluster } from "../api";

export const getDropletByName = async name => {
  const result = await getDroplets();
  let clusterDroplet = false;
  if (result) {
    result.droplets.forEach(droplet => {
      if (droplet.name === name) {
        clusterDroplet = droplet;
      }
    });
  }

  return clusterDroplet;
};

export const getLoadBalancerById = async id => {
  const result = await getLoadBalancers();

  let clusterLoadBalancer = { status: "" };
  if (result) {
    result.load_balancers.forEach(loadBalancer => {
      let ids = loadBalancer.droplet_ids;

      if (ids && ids.length >= 1 && ids.includes(id)) {
        clusterLoadBalancer = loadBalancer;
      }
    });
  }

  return clusterLoadBalancer;
};

export const getLoadBalancer = async name => {
  const droplet = await getDropletByName(name);
  if (!droplet || !droplet.id) {
    throw new Error(`droplet not found ${name}`);
  }
  const balancer = await getLoadBalancerById(droplet.id);
  return balancer;
};

export const getClusterName = async clusterId => {
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

export const getLoadBalancerIp = async clusterId => {
  const name = await getClusterName(clusterId);
  const balancer = await getLoadBalancer(name);
  if (balancer && balancer.id && balancer.ip) {
    console.log("ip", balancer.ip);
    return balancer.ip;
  }

  return false;
};
