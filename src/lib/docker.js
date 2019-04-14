const path = require("path");
const { spawnSync } = require("child_process");
const DIR = process.env.CODE_DIR || "/tmp";

const build = (name, dirPath, sha) => {
  const buildPath = path.resolve(`${DIR}/${sha}`, dirPath);
  const imgName = `gcr.io/elenchos-registry/${name}:${sha}`;

  console.log("BUILD ", buildPath, imgName);
  const build = spawnSync(
    "gcloud",
    [
      "builds",
      "submit",
      "--project=elenchos-registry",
      "-t",
      `${imgName}`,
      `${dirPath}`
    ],
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

export const buildAndPush = (name, path, sha) => {
  const imgName = build(name, path, sha);
  return imgName;
};
