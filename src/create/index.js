import express from "express";
// import { createDeployment } from "../lib";
// import { dbConnect } from "../db/connect";
// import { saveReleaseToDB } from "../db/queries";

const router = express.Router();

router.get("/", async (req, res) => {
  /*
  try {
    await dbConnect();
    await saveReleaseToDB({
      sha: "123",
      cluster_id: "2",
      pr_state: "closed",
      cluster_state: "in_progress"
    });
    // temp to test Github update
    const result = await createDeployment(req.body);
    console.log("result", result);
  } catch (e) {
    console.log(e.message);
  }
  */

  res.send("create");
});

export default router;
