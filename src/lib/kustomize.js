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

const writeKustomization = (sha, overlayPath, config) => {
  const filePath = `${DIR}/${sha}/${overlayPath}/kustomization.yaml`;
  return fs.writeFile(filePath, config, function(e) {
    if (e) {
      console.error(e.message);
      return false;
    }
    return true;
  });
};

export const editKustomization = async (sha, overlayPath, images) => {
  let config = await loadKustomization(sha, overlayPath);
  if (!config) return false;
  config.images = images;
  return writeKustomization(sha, overlayPath, config);
};
