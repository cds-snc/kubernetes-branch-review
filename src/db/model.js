const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  {
    refId: String,
    sha: String, // of the push
    cluster_id: String,
    pr_state: {
      type: String,
      enum: ["open", "closed"]
    },
    cluster_state: {
      type: String,
      enum: [
        "none",
        "pending",
        "queued",
        "in_progress",
        "error",
        "failure",
        "success"
      ]
    },
    branch: String,
    repo: String
  },
  { timestamps: true }
);

export const Model = mongoose.model("pull_requests", schema);
