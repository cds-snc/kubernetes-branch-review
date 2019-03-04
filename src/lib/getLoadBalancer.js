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

  let clusterLoadBalancer = false;
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
  if (!droplet || !droplet.id) return false;
  const balancer = await getLoadBalancerById(droplet.id);
  return balancer;
};

export const getLoadBalancerIp = async clusterId => {
  const cluster = await getCluster(clusterId);
  const name = cluster.kubernetes_cluster.node_pools[0].nodes[0].name;
  console.log("name", name);
  const balancer = await getLoadBalancer(name);
  if (balancer && balancer.id && balancer.ip) {
    console.log("ip", balancer.ip);
    return balancer.ip;
  }

  return false;
};
