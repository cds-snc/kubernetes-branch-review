import octokit from "@octokit/rest";
export { createDeployment } from "./githubNotify";
export { longPoll } from "./longPoll";
// export { workerStatus } from "../lib/returnStatus";
export { deployRelease } from "../lib/deployRelease";

//module.exports.workerStatus = workerStatus;
//module.exports.deployRelease = deployRelease;

export default new octokit();
