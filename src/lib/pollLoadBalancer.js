import { longPoll } from "./longPoll";
import { getClusterName, getLoadBalancer } from "../lib/getLoadBalancer";

export const pollLoadBalancer = async (clusterId, checkState = "active") => {
  return new Promise(async resolve => {
    const poll = Object.assign({}, longPoll);
    poll.delay = 2000;

    const name = await getClusterName(clusterId);
    console.log("name", name);

    poll.check = async () => {
      const result = await getLoadBalancer(name);
      // console.log(result);
      const loadBalancerState = result.status;

      console.log(`current load balancer state ... ${loadBalancerState}`);

      if (loadBalancerState === checkState) {
        return result;
      }

      if (poll.counter >= 20) {
        // bail
        return result;
      }
    };

    poll.eventEmitter.on("done", result => {
      const loadBalancerState = result.status;
      console.log(`done polling ${loadBalancerState}`);
      resolve(result);
    });

    poll.start();
  });
};
