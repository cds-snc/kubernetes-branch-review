const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    sha: String,
    cluster_id: String,
    state: String
  },
  { timestamps: true }
);

export const Model = mongoose.model("pull_requests", schema);
