const path = require("path");
const { spawnSync } = require("child_process");
const DIR = process.env.CODE_DIR || "/tmp";

const build = (name, dirPath, sha) => {
  const buildPath = path.resolve(`${DIR}/${sha}`, dirPath);
  const imgName = `gcr.io/elenchos/${name}:${sha}`;

  console.log("BUILD ", buildPath, imgName);

  const build = spawnSync(
    "docker",
    ["build", "-t", `${imgName}`, `${buildPath}`],
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
  console.log("PUSH ", imgName);

  const push = spawnSync("docker", ["push", `${imgName}`]);

  if (push.stderr && push.stderr.toString()) {
    console.log(push.stderr.toString());
    return false;
  }

  return push;
};

export const buildAndPush = (name, path, sha) => {
  const imgName = build(name, path, sha);
  return push(imgName);
};
