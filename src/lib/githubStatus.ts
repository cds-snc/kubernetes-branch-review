/* https://octokit.github.io/rest.js/ */

import { authenticate } from "./githubAuth";
import { getDeployment } from "../db/queries";
import { RequestBody } from "../interfaces/Request";
import { Status, StatusMessage } from "../interfaces/Status";
import { getInstallationId } from "../lib/getInstallationId";

const validate = (event: RequestBody) => {
  if (
    !event ||
    !event.repository ||
    !event.repository.name ||
    !event.repository.owner ||
    !event.repository.owner.login
  ) {
    return false;
  }

  return true;
};

export const updateStatus = async (
  event: RequestBody,
  status: StatusMessage = { state: "pending", description: "..." },
  refId: string
) => {
  if (!validate(event)) return false;

  if (!event) {
    console.log("no event passed");
    return;
  }

  const client = await authenticate(getInstallationId(event));
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;

  let target_url = ""; // this will be the deployment url

  if (status.state === "success") {
    const deployment = await getDeployment({ refId: refId });

    if (deployment && deployment.load_balancer_ip) {
      const ip = deployment.load_balancer_ip;
      target_url = `http://${ip}`;
    }
  }
  let sha;
  if (event.pull_request) {
    sha = event.pull_request.head.sha;
  } else {
    sha = event.after;
  }

  const statusObj: StatusMessage = Object.assign(status, {
    owner: repoOwner,
    repo: repoName,
    sha: sha,
    context: "K8's branch deploy"
  });

  if (target_url) {
    statusObj.target_url = target_url;
  }

  const result = await client.repos.createStatus(statusObj);

  return result;
};
