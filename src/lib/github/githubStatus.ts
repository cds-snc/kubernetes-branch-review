/* https://octokit.github.io/rest.js/ */

import { authenticate } from "./githubAuth";
import { getDeployment } from "../../db/queries";
import { RequestBody } from "../../interfaces/Request";
import { StatusMessage } from "../../interfaces/Status";
import { getInstallationId } from "../util/getInstallationId";
import { getSha } from "../util/getSha";

const validate = (event: RequestBody) => {
  if (
    !event ||
    !event.repository ||
    !event.repository.name ||
    !event.repository.owner ||
    !event.repository.owner.login
  ) {
    console.log("failed to validate event");
    return false;
  }

  return true;
};

const getTargetUrl = async (status: StatusMessage, refId: string) => {
  let target_url = ""; // this will be the deployment url

  if (status && status.state !== "success") {
    return {};
  }

  const deployment = await getDeployment({ refId: refId });

  if (deployment && deployment.load_balancer_ip) {
    const ip = deployment.load_balancer_ip;
    target_url = `http://${ip}`;
  }

  return target_url ? { target_url } : {};
};

export const updateStatus = async (
  event: RequestBody,
  status: StatusMessage = { state: "pending", description: "..." },
  refId: string
) => {
  if (!validate(event)) return false;

  const client = await authenticate(getInstallationId(event));
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;
  const sha = getSha(event);

  const statusObj: StatusMessage = Object.assign(
    status,
    {
      owner: repoOwner,
      repo: repoName,
      sha: sha,
      context: "K8's branch deploy"
    },
    await getTargetUrl(status, refId)
  );

  const result = await client.repos.createStatus(statusObj);

  return result;
};
