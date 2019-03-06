import { getRelease, saveReleaseToDB } from "../db/queries";
import { getLoadBalancerIp } from "../lib/getLoadBalancer";
import { pollLoadBalancer } from "../lib/pollLoadBalancer";
import { updateDeployment, updateDeploymentStatus } from "../lib/githubNotify";

export const saveIp = async ({ refId }) => {
  const record = await getRelease({ refId });
  const clusterId = record.cluster_id;

  await pollLoadBalancer(clusterId);

  const ip = await getLoadBalancerIp(clusterId);
  await saveReleaseToDB({ refId }, { load_balancer_ip: ip });
  return ip;
};

export const saveIpAndUpdate = async (req, sha, refId) => {
  const ip = await saveIp({ refId });
  const deployment = await updateDeployment(req, sha);

  if (!deployment || !deployment.data || !deployment.data.id) {
    return false;
  }

  await updateDeploymentStatus(req, {
    log_url: `http://${ip}`,
    environment_url: `http://${ip}`,
    deployment_id: deployment.data.id
  });
};
