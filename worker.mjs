/* note this file must be a .js or .mjs file*/

const { workerData, isMainThread } = require("worker_threads");

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

if (!isMainThread) {
  console.log("worker.ts => workerData:", workerData);
}

const hello = async () => {
  await sleep(10000);
  console.log("worker.ts => paused for 10000ms some long running process");
};

hello();
