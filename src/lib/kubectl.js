import yaml from "js-yaml";
const { spawnSync } = require("child_process");
const fs = require("fs");

const DIR = process.env.CODE_DIR || "/tmp";

const writeKubeconfig = (sha, config) => {
  const filePath = `${DIR}/${sha}/kubeconfig.yaml`;
  return fs.writeFile(filePath, yaml.safeDump(config), function(e) {
    if (e) {
      console.error(e.message);
      return false;
    }
    return true;
  });
};

export const applyConfig = (sha, overlayPath, config) => {
  const result = writeKubeconfig(sha, config);
  if (!result) {
    return false;
  }
  const kustomize = spawnSync("kustomize", ["build", overlayPath]);

  if (kustomize.stderr && kustomize.stderr.toString()) {
    console.log(kustomize.stderr.toString());
    return false;
  }

  const kubectl = spawnSync(
    "kubectl",
    ["apply", "--kubeconfig", `${DIR}/${sha}/kubeconfig.yaml`, "-f", "-"],
    {
      input: kustomize.stdout
    }
  );

  if (kubectl.stderr && kubectl.stderr.toString()) {
    console.log(kubectl.stderr.toString());
    return false;
  }

  return true;
};
