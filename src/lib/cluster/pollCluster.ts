import { longPoll } from "../util/longPoll";
import { getCluster } from "../../api";
import { Cluster } from "../../interfaces/Cluster";
import { StatusMessage } from "../../interfaces/Status";

export const pollCluster = async (
  clusterId: string,
  checkState: string = "running",
  reporter: (msg: string, status?: StatusMessage["state"]) => void = () => {}
): Promise<void | { kubernetes_cluster: Cluster }> => {
  return new Promise(resolve => {
    const poll = Object.assign({}, longPoll);
    const prefix = "cluster";
    const id = `${prefix}-${clusterId}`;
    poll.id = id;
    poll.delay = 20000;

    poll.check = async (): Promise<void | { kubernetes_cluster: Cluster }> => {
      const result = await getCluster(clusterId);

      if (result) {
        const clusterState = result.kubernetes_cluster.status.state;
        reporter(`current cluster state ... ${clusterState} ⏱️`, "pending");

        if (clusterState === checkState) {
          return result;
        }

        const timeout = 300;

        if (poll.counter >= timeout) {
          // bail
          reporter(`poll cluster timed out after ${timeout}`, "failure");
          poll.clear();
          return result;
        }
      }
    };

    poll.eventEmitter.on(`done-${id}`, result => {
      if (poll.id === `${prefix}-${clusterId}`) {
        const clusterState = result.kubernetes_cluster.status.state;
        if (reporter) {
          reporter(`current cluster state ... ${clusterState}`, "pending");
        }
        poll.clear();
        resolve(result);
      }
    });

    poll.start();
  });
};
