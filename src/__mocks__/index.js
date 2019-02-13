import path from "path";
import { getFile } from "../lib/getFile";

export const eventJS = async (filename = "") => {
  const file = path.resolve(__dirname, `./github/${filename}.json`);
  const result = await getFile(file);
  try {
    return JSON.parse(result);
  } catch (e) {
    console.log("failed to parse payload", e.message);
    return {};
  }
};
