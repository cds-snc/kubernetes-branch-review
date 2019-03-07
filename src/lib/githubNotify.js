import { authenticate } from "./githubAuth";
import { getDeployment } from "../db/queries";
export const createDeployment = async (
  event,
  status = { task: "deploy", description: "Initializing deployment" }
) => {
  const client = await authenticate(event.installation.id);
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;
  const sha = event.pull_request.head.sha;

  const statusObj = Object.assign(
    {
      owner: repoOwner,
      repo: repoName,
      ref: sha,
      environment: "staging",
      payload: "from the app"
    },
    status
  );

  let result = "";

  try {
    result = await client.repos.createDeployment(statusObj);
  } catch (e) {
    console.log(e.message);
  }

  return result;
};

export const updateDeploymentStatus = async (
  event,
  status = { state: "success", description: "deployment updated" },
  refId
) => {
  const deployment = getDeployment({ refId: refId });
  const client = await authenticate(event.installation.id);
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;
  const ip = deployment.ip;

  const statusObj = Object.assign(
    {
      owner: repoOwner,
      repo: repoName,
      environment: "staging",
      deployment_id: deployment.id,
      log_url: `http://${ip}`,
      environment_url: `http://${ip}`
    },
    status
  );

  console.log("***************");
  console.log(statusObj);
  console.log("***************");

  let result = "";

  try {
    result = await client.repos.createDeploymentStatus(statusObj);
    console.log("====== deployment status =====");
    console.log(result);
  } catch (e) {
    console.log(e);
  }

  return result;
};
