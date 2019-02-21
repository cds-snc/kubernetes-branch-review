/*
{"kubernetes_cluster":{"id":"f72b5622-1a04-485f-8977-876db09ff0ad","name":"stage-cluster-01","region":"nyc1","version":"1.12.1-do.2","cluster_subnet":"10.244.0.0/16","service_subnet":"10.245.0.0/16","ipv4":"159.65.230.218","endpoint":"https://f72b5622-1a04-485f-8977-876db09ff0ad.k8s.ondigitalocean.com","tags":["stage","k8s","k8s:f72b5622-1a04-485f-8977-876db09ff0ad"],"node_pools":[{"id":"ad750855-bd04-4a4c-bfe6-388e95c578b9","name":"frontend-pool","size":"s-1vcpu-2gb","count":1,"tags":["frontend","k8s","k8s:f72b5622-1a04-485f-8977-876db09ff0ad","k8s:worker"],"nodes":[{"id":"1a877c94-410e-4c44-a5c0-dbd241e05330","name":"vigilant-keller-uoet","status":{"state":"running"},"created_at":"2019-02-20T15:34:22Z","updated_at":"2019-02-20T15:36:11Z"}]}],"status":{"state":"running"},"created_at":"2019-02-20T15:34:22Z","updated_at":"2019-02-20T15:36:11Z"}}
*/
import { longPoll } from "../lib/longPoll";
import { getCluster } from "../api";

export const pollCluster = async (clusterId, checkState = "running") => {
  return new Promise(resolve => {
    const poll = longPoll;
    poll.delay = 20000;

    poll.check = async () => {
      const result = await getCluster(clusterId);
      const clusterState = result.kubernetes_cluster.status.state;

      console.log("current cluster state", clusterState);

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
      console.log("current cluster state", clusterState);
      console.log("done polling");
      resolve(result);
    });

    poll.start();
  });
};
