import express from "express";
export const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  res.send("hello");
});
