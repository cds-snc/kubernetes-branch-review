const fs = require("fs");
import yaml from "js-yaml";
import { Config } from "../interfaces/Config";

export const writeFile = (
  filePath: string,
  config: string | Config
): boolean => {
  try {
    let configObj;

    if (typeof config === "string") {
      configObj = JSON.parse(config);
    } else {
      configObj = config;
    }

    fs.writeFile(filePath, yaml.safeDump(configObj), "utf8", (e: Error) => {
      console.log("filePath", filePath);
      console.log(config);
      console.error(e);
    });
    return true;
  } catch (e) {
    console.log("filePath", filePath);
    console.log(config);
    console.error("writeFile error", e.message);
    return false;
  }
};
