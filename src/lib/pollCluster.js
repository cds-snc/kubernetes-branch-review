import { longPoll } from "../lib/longPoll";
import { getCluster } from "../api";

export const pollCluster = async (clusterId, checkState = "running", cb) => {
  return new Promise(resolve => {
    const poll = longPoll;
    poll.delay = 20000;

    poll.check = async () => {
      const result = await getCluster(clusterId);
      const clusterState = result.kubernetes_cluster.status.state;

      console.log(`current cluster state ... ${clusterState}`);

      if (clusterState === checkState) {
        return result;
      }

      if (poll.counter >= 20) {
        // bail
        return result;
      }
    };

    poll.eventEmitter.on("done", result => {
      const clusterState = result.kubernetes_cluster.status.state;
      console.log(`done polling ${clusterState}`);
      resolve(result);
    });

    poll.start();
  });
};
