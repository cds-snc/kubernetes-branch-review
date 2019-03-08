import { authenticate } from "./githubAuth";
import { getDeployment } from "../db/queries";
export const createDeployment = async (
  event,
  status = { task: "deploy", description: "Initializing deployment" }
) => {
  const client = await authenticate(event.installation.id);
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;
  let sha;

  if (event.pull_request) {
    sha = event.pull_request.head.sha;
  } else {
    sha = event.after;
  }

  const statusObj = Object.assign(
    {
      owner: repoOwner,
      repo: repoName,
      ref: sha,
      environment: "staging",
      payload: "from the app",
      auto_merge: false
    },
    status
  );

  let result = "";

  try {
    result = await client.repos.createDeployment(statusObj);
  } catch (e) {
    // console.log(e);
    console.log("createDeployment", e.message);
  }

  return result.data;
};

export const updateDeploymentStatus = async (
  event,
  status = { state: "success", description: "deployment updated" },
  refId
) => {
  const deployment = await getDeployment({ refId: refId });
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

  let result = "";

  try {
    result = await client.repos.createDeploymentStatus(statusObj);
  } catch (e) {
    console.log(e);
  }

  return result;
};
