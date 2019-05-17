import { getRelease, saveReleaseToDB } from "../db/queries";
import { getLoadBalancerIp } from "../lib/getLoadBalancer";
import { pollLoadBalancer } from "../lib/pollLoadBalancer";
import { statusReporter } from "../lib/statusReporter";
import { updateDeploymentStatus } from "../lib/githubNotify";
import { Request } from "../interfaces/Request";

const hasIp = async (req: Request, refId: string) => {
  const record = await getRelease({ refId });

  if (record && record.load_balancer_ip) {
    console.log(`record.load_balancer_ip ${record.load_balancer_ip}`);
    return record.load_balancer_ip;
  }

  return false;
};

export const saveIp = async ({
  req,
  refId
}: {
  req: Request;
  refId: string;
}) => {
  const record = await getRelease({ refId });

  await hasIp(req, refId);

  if (record) {
    const clusterId = record.cluster_id;
    await pollLoadBalancer(clusterId, "active", async (msg: string) => {
      await statusReporter(req, msg);
    });

    const ip = await getLoadBalancerIp(clusterId);

    if (ip) {
      await saveReleaseToDB({ refId, load_balancer_ip: ip });
    }

    return ip;
  }
};

export const saveIpAndUpdate = async (req: Request, refId: string) => {
  const ip = await hasIp(req, refId);
  if (ip) return;

  await saveIp({ req, refId });
  await updateDeploymentStatus(
    req.body,
    { state: "success", description: "save ip" },
    refId
  );
};
