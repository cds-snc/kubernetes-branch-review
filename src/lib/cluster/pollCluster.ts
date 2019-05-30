import { longPoll } from "../util/longPoll";
import { getCluster } from "../../api";
import { Cluster, StatusMessage } from "../../interfaces";

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
        let clusterState = "";

        /* 
        added to handle clearing the poll if it's running 
        and the cluster has already been deleted

        i.e. open a pr -> close a pr before cluster to spun up
        */
        try {
          clusterState = result.kubernetes_cluster.status.state;
        } catch (e) {
          console.log("cleared cluster polling")
          poll.clear();
        }

        reporter(`current cluster state... ${clusterState} ⏱️`, "pending");

        if (clusterState === checkState) {
          return result;
        }

        if (poll.counter >= 300) {
          reporter(`poll cluster timed out `, "failure");
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
