import { getFile } from "./getFile";
import yaml from "js-yaml";
import { Config } from "../interfaces/Config";

const fs = require("fs");
const DIR = process.env.CODE_DIR || "/tmp";

const loadKustomization = async (sha: string, overlayPath: string) => {
  const configData = await getFile(
    `${DIR}/${sha}/${overlayPath}/kustomization.yaml`
  );
  if (!configData) return false;
  try {
    return yaml.safeLoad(configData.toString("utf8"));
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

const writeKustomization = async (
  sha: string,
  overlayPath: string,
  config: Config
): Promise<boolean> => {
  const filePath = `${DIR}/${sha}/${overlayPath}/kustomization.yaml`;
  try {
    fs.writeFile(filePath, yaml.safeDump(config), "utf8", (e: Error) =>
      console.error(e)
    );
    return true;
  } catch (e) {
    console.error("writeKustomization", e.message);
    return false;
  }
};

export const editKustomization = async (
  sha: string,
  overlayPath: string,
  images: {}[]
): Promise<string | boolean> => {
  let config = await loadKustomization(sha, overlayPath);
  if (!config) return false;
  config.images = images;
  return writeKustomization(sha, overlayPath, config);
};
