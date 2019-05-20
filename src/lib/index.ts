import octokit from "@octokit/rest";
export { createDeployment } from "./github/githubNotify";
export { longPoll } from "./util/longPoll";
// export { workerStatus } from "../lib/returnStatus";
export { deployRelease } from "./deploy/deployRelease";

export default new octokit();
