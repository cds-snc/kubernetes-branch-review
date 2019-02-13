import express from "express";
// import { notify } from "../lib";
import { dbConnect } from "../db/connect";
import { saveReleaseToDB } from "../db/queries";
export const router = express.Router();
router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  res.send("hello");
});

router.get("/notify", async (req, res) => {
  try {
    await dbConnect();
    await saveReleaseToDB({ sha: "123", cluster_id: "2", state: "ping" });
    // notify();
  } catch (e) {}

  res.send("notify");
});
