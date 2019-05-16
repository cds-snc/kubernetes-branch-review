import { getRelease, saveReleaseToDB } from "../db/queries";
import { getLoadBalancerIp } from "../lib/getLoadBalancer";
import { pollLoadBalancer } from "../lib/pollLoadBalancer";
import { statusReporter } from "../lib/statusReporter";
import { updateDeploymentStatus } from "../lib/githubNotify";
import { Request } from "../interfaces/Request";

export const saveIp = async ({
  req,
  refId
}: {
  req: Request;
  refId: string;
}) => {
  const record = await getRelease({ refId });
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
  await saveIp({ req, refId });
  await updateDeploymentStatus(
    req.body,
    { state: "success", description: "save ip" },
    refId
  );
};
