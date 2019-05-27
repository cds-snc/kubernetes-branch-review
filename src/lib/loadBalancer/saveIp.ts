import { getRelease, saveReleaseToDB } from "../../db/queries";
import { getLoadBalancerIp } from "./getLoadBalancer";
import { pollLoadBalancer } from "./pollLoadBalancer";
import { statusReporter } from "../util/statusReporter";
import { updateDeploymentStatus } from "../github/githubNotify";
import { Request, StatusMessage } from "../../interfaces";

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
    await pollLoadBalancer(
      clusterId,
      "active",
      async (msg: string, status: StatusMessage["state"] = "pending") => {
        await statusReporter(req, msg, status);
      }
    );

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
