import { authenticate } from "./githubAuth";
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

export const updateDeployment = async (
  event,
  sha,
  status = { task: "deploy", description: "Updating deployment" }
) => {
  const client = await authenticate(event.installation.id);
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;

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
  status = { target_url: "" }
) => {
  const client = await authenticate(event.installation.id);
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;

  const statusObj = Object.assign(
    {
      owner: repoOwner,
      repo: repoName,
      state: "success",
      environment: "staging",
      description: "deployment updated"
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
