const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const fakeDeploy = async (req, refId, currentRelease) => {
  await sleep(5000);
  console.log("hello");
  console.log(req);
  console.log(refId);
  console.log(currentRelease);
};

module.exports.fakeDeploy = fakeDeploy;
