import { longPoll } from "./longPoll";
import { getClusterName, getLoadBalancer } from "../lib/getLoadBalancer";

export const pollLoadBalancer = async (
  clusterId: string,
  checkState: string = "active",
  reporter: (msg: string) => void = () => {}
): Promise<void> => {
  return new Promise(async resolve => {
    const poll = Object.assign({}, longPoll);
    const prefix = "load-balancer";
    const id = `${prefix}-${clusterId}`;
    poll.id = id;
    poll.delay = 10000;

    const name = await getClusterName(clusterId);
    console.log("cluster name", name);

    if (name instanceof Error) {
      return false;
    }

    poll.check = async () => {
      const result = await getLoadBalancer(name);

      if (result instanceof Error) {
        return false;
      }

      let loadBalancerState = "";

      if (result && result.status) {
        loadBalancerState = result.status;
      }
      // message for the logs
      let loadBalancerMsg = loadBalancerState || "⏱️";

      if (loadBalancerMsg === "active") {
        loadBalancerMsg += " ✅";
      }

      reporter(`current load balancer state ... ${loadBalancerMsg}`);

      if (loadBalancerState === checkState) {
        return result;
      }

      const timeout = 300;

      if (poll.counter >= timeout) {
        // bail
        const result = await getLoadBalancer(name);
        reporter(`poll load balancer timed out after ${timeout}`);
        poll.clear();
        return result;
      }
    };

    poll.eventEmitter.on(`done-${id}`, result => {
      if (poll.id === `${prefix}-${clusterId}`) {
        const loadBalancerState = result.status;
        reporter(`⚡ done polling ${loadBalancerState} ⚡ `);
        poll.clear();
        resolve(result);
      }
    });

    poll.start();
  });
};
