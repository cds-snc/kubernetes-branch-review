import express from "express";
import { createDeployment } from "../lib";
import { dbConnect } from "../db/connect";
import { saveReleaseToDB } from "../db/queries";
import { eventJS } from "../__mocks__";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await dbConnect();
    await saveReleaseToDB({ sha: "123", cluster_id: "2", state: "ping" });
    // temp to test Github update
    const event = await eventJS("create_a_pr");
    const result = await createDeployment(event.body);
    console.log("result", result);
  } catch (e) {
    console.log(e.message);
  }

  res.send("create");
});

export default router;
