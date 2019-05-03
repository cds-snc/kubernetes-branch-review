import { dbConnect } from "./connect";
import { getFullNameFromRefId } from "../lib/getRefId";
const { Model } = require("./model");
import { Query } from "../interfaces/Query";
import { Release } from "../interfaces/Release";

export const saveReleaseToDB = async (obj: Query): Promise<Release|void> => {
  await dbConnect();

  if (!obj || !obj.refId) {
    throw new Error("no refId passed");
  }

  const query = { refId: obj.refId };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  // find and update or insert new
  try {
    const release = await Model.findOneAndUpdate(query, obj, options).exec();
    return release;
  } catch (e) {
    console.error(e.message);
  }
};

export const getRelease = async (obj:Query, query = { refId: obj.refId }): Promise<Release|false> => {
  await dbConnect();
  try {
    let record = await Model.findOne(query).exec();
    if (!record || !record.refId) return false;
    record.fullName = getFullNameFromRefId(record.refId);
    return record;
  } catch (e) {
    console.error(e.message);
    return false;
  }
};

export const getDeployment = async (query: Query): Promise<false|Release> => {
  const release = await getRelease(query);
  if (!release || !release.deployment_id) {
    console.log("no release or deployment found", release);
    return false;
  }
  // return { id: release.deployment_id, ip: release.load_balancer_ip };
  return release;
};
