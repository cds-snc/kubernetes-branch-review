const fs = require("fs");
import yaml from "js-yaml";
import { Config } from "../../interfaces/Config";

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

    //@todo test to see if we can remove the callback and catch with the try / catch
    fs.writeFile(filePath, yaml.safeDump(configObj), "utf8", (e: Error) => {
      if (e) {
        console.log("writeFile error");
        console.log("filePath", filePath);
        console.log(config);
        console.error(e);
      }
    });
    return true;
  } catch (e) {
    console.log("writeFile error catch");
    console.log("filePath", filePath);
    console.log(config);
    console.error(e);
    return false;
  }
};
