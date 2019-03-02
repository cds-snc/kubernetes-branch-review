import yaml from "js-yaml";
const { exec, spawnSync } = require("child_process");
const fs = require("fs");
const { promisify } = require("util");
export const execAsync = promisify(exec);
const DIR = process.env.CODE_DIR || "/tmp";

const writeKubeconfig = (sha, config) => {
  const filePath = `${DIR}/${sha}/kubeconfig.yaml`;
  const configObj = JSON.parse(config);
  try {
    fs.writeFile(filePath, yaml.safeDump(configObj), "utf8", e =>
      console.error(e)
    );
    return true;
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

export const applyConfig = async (sha, overlayPath, config) => {
  const result = writeKubeconfig(sha, config);
  if (!result) {
    return false;
  }

  await execAsync(`kustomize build > ${sha}.yaml`, {
    cwd: `${DIR}/${sha}/${overlayPath}`
  });

  const kubectl = spawnSync("kubectl", [
    "apply",
    "--kubeconfig",
    `${DIR}/${sha}/kubeconfig.yaml`,
    "-f",
    `${DIR}/${sha}/${overlayPath}/${sha}.yaml`
  ]);

  if (kubectl.stderr && kubectl.stderr.toString()) {
    console.log(kubectl.stderr.toString());
    return false;
  }

  return true;
};
