import { LoadBalancer } from "../../interfaces";
import { getLoadBalancers, deleteLoadBalancer } from "../../api";

export const deleteUnusedLoadBalancers = async () => {
  const result = await getLoadBalancers();

  if (result && result.load_balancers) {
    result.load_balancers.forEach((loadBalancer: LoadBalancer) => {
      let ids = loadBalancer.droplet_ids;

      if (!ids.length) {
        deleteLoadBalancer(loadBalancer.id);
      }
    });
  }
};
