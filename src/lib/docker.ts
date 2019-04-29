const path = require("path");
const { spawnSync } = require("child_process");
const DIR = process.env.CODE_DIR || "/tmp";

export const buildAndPush = (name:string, dirPath:string, sha:string): string=> {
  const buildPath = path.resolve(`${DIR}/${sha}`, dirPath);
  const imgName = `gcr.io/elenchos-registry/${name}:${sha}`;

  console.log("BUILD ", buildPath, imgName);
  spawnSync(
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

  return imgName;
};