import { dbConnect } from "./connect";

const { Model } = require("./model");

export const saveReleaseToDB = async obj => {
  await dbConnect();
  const query = { refId: obj.refId };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  // find and update or insert new
  try {
    await Model.findOneAndUpdate(query, obj, options).exec();
    return;
  } catch (e) {
    console.log(e.message);
  }
};
