import express from "express";
// import { notify } from "../lib";

const { dbConnect } = require("../db/connect");
export const router = express.Router();
router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  res.send("hello");
});

router.get("/notify", async (req, res) => {
  try {
    await dbConnect();
    // notify();
  } catch (e) {}

  res.send("notify");
});
