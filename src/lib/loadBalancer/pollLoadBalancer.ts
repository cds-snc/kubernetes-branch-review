import { longPoll } from "../util/longPoll";
import { getClusterName, getLoadBalancer } from "./getLoadBalancer";
import { StatusMessage } from "../../interfaces/Status";

export const pollLoadBalancer = async (
  clusterId: string,
  checkState: string = "active",
  reporter: (msg: string, status?: StatusMessage["state"]) => void = () => {}
): Promise<void> => {
  return new Promise(async resolve => {
    const poll = Object.assign({}, longPoll);
    const prefix = "load-balancer";
    const id = `${prefix}-${clusterId}`;
    poll.id = id;
    poll.delay = 10000;

    const name = await getClusterName(clusterId);

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
      
      let loadBalancerMsg = loadBalancerState || "⏱️";

      if (loadBalancerMsg === "active") {
        loadBalancerMsg += " ✅";
      }

      reporter(`current load balancer state... ${loadBalancerMsg}`, "pending");

      if (loadBalancerState === checkState) {
        return result;
      }

      if (poll.counter >= 300) {
        const result = await getLoadBalancer(name);
        reporter(`poll load balancer timed out after`, "failure");
        poll.clear();
        return result;
      }
    };

    poll.eventEmitter.on(`done-${id}`, result => {
      if (poll.id === `${prefix}-${clusterId}`) {
        const loadBalancerState = result.status;
        reporter(`⚡ done polling ${loadBalancerState} ⚡ `, "success");
        poll.clear();
        resolve(result);
      }
    });

    poll.start();
  });
};
