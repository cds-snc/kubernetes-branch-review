import { longPoll } from "./longPoll";
import { getClusterName, getLoadBalancer } from "../lib/getLoadBalancer";
import { LoadBalancer } from "../interfaces/LoadBalancer";

export const pollLoadBalancer = async (
  clusterId: string,
  checkState: string = "active"
): Promise<void> => {
  return new Promise(async resolve => {
    const poll = Object.assign({}, longPoll);
    const prefix = "load-balancer";
    const id = `${prefix}-${clusterId}`;
    poll.id = id;
    poll.delay = 2000;

    const name = await getClusterName(clusterId);
    console.log("name", name);

    poll.check = async () => {
      const result = await getLoadBalancer(name);
      const loadBalancerState = result.status;
      // message for the logs
      let loadBalancerMsg = loadBalancerState || "⏱️";

      if (loadBalancerMsg === "active") {
        loadBalancerMsg += " ✅";
      }
      console.log(`current load balancer state ... ${loadBalancerMsg}`);

      if (loadBalancerState === checkState) {
        return result;
      }

      if (poll.counter >= 120) {
        // bail
        const result = await getLoadBalancer(name);
        console.log("=== load balancer ===");
        console.log(result);
        poll.clear();
        return result;
      }
    };

    poll.eventEmitter.on(`done-${id}`, result => {
      if (poll.id === `${prefix}-${clusterId}`) {
        const loadBalancerState = result.status;
        console.log(`done polling ${loadBalancerState}`);
        resolve(result);
      }
    });

    poll.start();
  });
};
