/* https://octokit.github.io/rest.js/ */

import { authenticate } from "./githubAuth";
import { getDeployment } from "../db/queries";

const validate = event => {
  if (
    !event ||
    !event.repository ||
    !event.repository.name ||
    !event.repository.owner ||
    !event.repository.owner.name
  ) {
    return false;
  }

  return true;
};

export const updateStatus = async (
  event,
  status = { state: "pending", description: "..." },
  refId
) => {
  if (!validate(event)) return false;

  if (!event || !event.installation) {
    console.log("no event.installation");
    return;
  }

  const client = await authenticate(event.installation.id);
  const repoOwner = event.repository.owner.name;
  const repoName = event.repository.name;

  if (status.state === "success") {
    const deployment = await getDeployment({ refId: refId });

    if (deployment && deployment.ip) {
      const ip = deployment.ip;
      status.target_url = `http://${ip}`;
    }
  }

  const statusObj = Object.assign(
    {
      owner: repoOwner,
      repo: repoName,
      sha: event.after,
      context: "K8's branch deploy"
    },
    status
  );

  const result = await client.repos.createStatus(statusObj);

  return result;
};
