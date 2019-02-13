import express from "express";
import { createDeployment } from "../lib";
import { dbConnect } from "../db/connect";
import { saveReleaseToDB } from "../db/queries";
import { eventJS } from "../__mocks__";

export const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  res.send("hello");
});

router.get("/deploy", async (req, res) => {
  try {
    await dbConnect();
    await saveReleaseToDB({ sha: "123", cluster_id: "2", state: "ping" });
    // temp to test Github update
    const event = await eventJS("create_a_pr");
    createDeployment(event.body);
  } catch (e) {
    console.log(e.message);
  }

  res.send("notify");
});
