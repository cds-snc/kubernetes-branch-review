export const getVersion = (): string => {
  const pjson = require("../../../package.json");

  if (pjson && pjson.version) {
    return pjson.version;
  }

  return "0.0.0";
};
