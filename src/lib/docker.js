const path = require("path");
const { spawnSync } = require("child_process");
const DIR = process.env.CODE_DIR || "/tmp";

const build = (name, dirPath, sha) => {
  const buildPath = path.resolve(`${DIR}/${sha}`, dirPath);
  const imgName = `elenchos/${name}:${sha}`;

  console.log("BUILD ", buildPath, imgName);
  console.log("build", "-t", `${imgName}`, `${dirPath}`);
  const build = spawnSync(
    "docker",
    ["build", "-t", `${imgName}`, `${dirPath}`],
    {
      cwd: `${DIR}/${sha}`
    }
  );

  if (build.stderr && build.stderr.toString()) {
    console.log(build.stderr.toString());
    return false;
  }

  return imgName;
};

const push = imgName => {
  if (!imgName) {
    return false;
  }
  console.log("PUSH ", imgName);

  const push = spawnSync("docker", ["push", `${imgName}`]);

  if (push.stderr && push.stderr.toString()) {
    console.log(push.stderr.toString());
    return false;
  }

  return imgName;
};

export const buildAndPush = (name, path, sha) => {
  const imgName = build(name, path, sha);
  return push(imgName);
};
