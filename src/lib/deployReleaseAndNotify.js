// const deployRelease = require("/src/lib/index").deployRelease;
// const workerStatus = require("/src/lib/index").workerStatus;
// import { deployRelease, workerStatus } from "./index";

const deployReleaseAndNotify = async (
  req,
  refId,
  currentRelease,
  workerStatus
) => {
  const body = req.body;

  //const deployStatus = await deployRelease(req, refId, currentRelease);

  /*
  if (deployStatus && typeof deployStatus === "object") {
    return workerStatus(body, deployStatus);
  }
  */
  /*
  return workerStatus(body, {
    state: "error",
    description: "no release found"
  });
  */
};

module.exports.deployReleaseAndNotify = deployReleaseAndNotify;
