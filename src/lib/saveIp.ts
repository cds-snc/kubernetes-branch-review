import { getRelease, saveReleaseToDB } from "../db/queries";
import { getLoadBalancerIp } from "../lib/getLoadBalancer";
import { pollLoadBalancer } from "../lib/pollLoadBalancer";
import { updateDeploymentStatus } from "../lib/githubNotify";
import { Request } from "../interfaces/Request";

export const saveIp = async ({ refId }: { refId: string }) => {
  const record = await getRelease({ refId });
  const clusterId = record.cluster_id;
  await pollLoadBalancer(clusterId);

  const ip = await getLoadBalancerIp(clusterId);
  await saveReleaseToDB({ refId, load_balancer_ip: ip });
  return ip;
};

export const saveIpAndUpdate = async (req: Request, refId: string) => {
  await saveIp({ refId });
  await updateDeploymentStatus(
    req.body,
    { state: "success", description: "save ip" },
    refId
  );
};
