/* note this file must be a .js or .mjs file*/

const { workerData, isMainThread } = require("worker_threads");

// const { fakeDeploy } = require("./src/lib/fakeDeploy");

// const { deployRelease } = require("./src/lib/deployRelease");
// const { workerStatus } = require("./src/lib/returnStatus");

const { deployReleaseAndNotify } = require("./src/lib/deployReleaseAndNotify");

if (!isMainThread) {
  //console.log("worker.ts => workerData:", workerData);
  //fakeDeploy(workerData.req, workerData.refId, workerData.release);
  deployReleaseAndNotify(workerData.req, workerData.refId, workerData.release);
}
