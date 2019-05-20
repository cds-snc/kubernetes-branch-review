/* note this file must be a .js or .mjs file */
/* typescript is set to compile back to commonjs + es5 */

const { workerData, isMainThread } = require("worker_threads");
const { deployReleaseAndNotify } = require("./dist/lib/deploy/deployRelease");

if (!isMainThread) {
  // console.log("worker.ts => workerData:", workerData);
  deployReleaseAndNotify(workerData.req, workerData.refId, workerData.release);
}
