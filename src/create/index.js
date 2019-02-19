import express from "express";
import { createCluster } from "./createCluster";

const router = express.Router();

router.get("/", async (req, res) => {
  const result = await createCluster(res);
  res.send(result);
});

export default router;
