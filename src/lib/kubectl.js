import yaml from "js-yaml";
const { spawnSync } = require("child_process");
const fs = require("fs");

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

export const applyConfig = (sha, overlayPath, config) => {
  const result = writeKubeconfig(sha, config);
  if (!result) {
    return false;
  }

  const kustomize = spawnSync("kustomize", ["build", overlayPath], {
    cwd: `${DIR}/${sha}`
  });

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
