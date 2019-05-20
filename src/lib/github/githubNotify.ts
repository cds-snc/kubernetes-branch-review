import { authenticate } from "./githubAuth";
import { getDeployment } from "../../db/queries";
import { RequestBody } from "../../interfaces/Request";
import { StatusMessage } from "../../interfaces/Status";
import { getInstallationId } from "../util/getInstallationId";
import { getSha } from "../util/getSha";
import {
  ReposCreateDeploymentParams,
  ReposCreateDeploymentStatusParams,
  ReposCreateDeploymentStatusResponse
} from "@octokit/rest";

export const createDeployment = async (
  event: RequestBody,
  status = { task: "deploy", description: "Initializing deployment" }
): Promise<{ id: string }> => {
  const client = await authenticate(getInstallationId(event));
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;
  const sha = getSha(event);

  const statusObj: ReposCreateDeploymentParams = Object.assign(
    {
      owner: repoOwner,
      repo: repoName,
      ref: sha,
      environment: "staging",
      payload: "from the app",
      auto_merge: false,
      required_contexts: []
    },
    status
  );

  let result = { data: { id: "" } };

  try {
    result = await client.repos.createDeployment(statusObj);
  } catch (e) {
    // console.log(e);
    // kill it ...
    console.log("createDeployment", e.message);
  }

  return result.data;
};

export const updateDeploymentStatus = async (
  event: RequestBody,
  status: StatusMessage = {
    state: "success",
    description: "deployment updated"
  },
  refId: string
): Promise<ReposCreateDeploymentStatusResponse | {}> => {
  const deployment = await getDeployment({ refId: refId });

  if (!deployment || !event) {
    console.log(`no deployment found`);
    return;
  }

  const client = await authenticate(getInstallationId(event));
  const repoOwner = event.repository.owner.login;
  const repoName = event.repository.name;
  const ip = deployment.load_balancer_ip;

  const deploymentStatus: ReposCreateDeploymentStatusParams = {
    owner: repoOwner,
    repo: repoName,
    environment: "staging",
    deployment_id: parseInt(deployment.deployment_id),
    log_url: ip ? `http://${ip}` : "",
    environment_url: ip ? `http://${ip}` : "",
    state: "pending"
  };

  const statusObj: ReposCreateDeploymentStatusParams = Object.assign(
    deploymentStatus,
    status
  );

  let result = {};

  try {
    result = await client.repos.createDeploymentStatus(statusObj);
  } catch (e) {
    // kill it
    console.log(e);
  }

  return result;
};
