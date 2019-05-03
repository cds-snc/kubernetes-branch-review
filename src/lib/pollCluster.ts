import { longPoll } from "../lib/longPoll";
import { getCluster } from "../api";
import { Cluster } from "../interfaces/Cluster";

export const pollCluster = async (
  clusterId: string,
  checkState: string = "running"
): Promise<void|{kubernetes_cluster: Cluster}> => {
  return new Promise(resolve => {
    const poll = Object.assign({}, longPoll);
    const prefix = "cluster";
    const id = `${prefix}-${clusterId}`;
    poll.id = id;
    poll.delay = 20000;

    poll.check = async (): Promise<void|{kubernetes_cluster: Cluster}> => {
      const result = await getCluster(clusterId);

      if (result){

        const clusterState = result.kubernetes_cluster.status.state;
        console.log(`current cluster state ... ${clusterState}`);

        if (clusterState === checkState) {
          return result;
        }

        if (poll.counter >= 20) {
          // bail
          return result;
        }
      }
    };

    poll.eventEmitter.on(`done-${id}`, result => {
      console.log("done pollCluster", result);
      if (poll.id === `${prefix}-${clusterId}`) {
        const clusterState = result.kubernetes_cluster.status.state;
        console.log(`done polling ${clusterState}`);
        resolve(result);
      }
    });

    poll.start();
  });
};
