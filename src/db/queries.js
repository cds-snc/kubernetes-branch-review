import { dbConnect } from "./connect";
import { getFullNameFromRefId } from "../lib/getRefId";
const { Model } = require("./model");

export const saveReleaseToDB = async obj => {
  await dbConnect();
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

export const getRelease = async (obj, query = { refId: obj.refId }) => {
  await dbConnect();
  try {
    let record = await Model.findOne(query).exec();
    if (!record || !record.refId) return false;
    record.fullName = getFullNameFromRefId(record.refId);
    return record;
  } catch (e) {
    console.error(e.message);
  }
};
