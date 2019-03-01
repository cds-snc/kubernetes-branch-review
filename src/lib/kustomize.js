import { getFile } from "./getFile";
import yaml from "js-yaml";

const fs = require("fs");
const DIR = process.env.CODE_DIR || "/tmp";

const loadKustomization = async (sha, overlayPath) => {
  const configData = await getFile(
    `${DIR}/${sha}/${overlayPath}/kustomization.yaml`
  );
  if (!configData) return false;
  try {
    return yaml.safeLoad(configData, "utf8");
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

const writeKustomization = async (sha, overlayPath, config) => {
  const filePath = `${DIR}/${sha}/${overlayPath}/kustomization.yaml`;
  try {
    fs.writeFile(filePath, yaml.safeDump(config), "utf8", e =>
      console.error(e)
    );
    return true;
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

export const editKustomization = async (sha, overlayPath, images) => {
  let config = await loadKustomization(sha, overlayPath);
  if (!config) return false;
  config.images = images;
  return writeKustomization(sha, overlayPath, config);
};
