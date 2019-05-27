import express from "express";
import { Request } from "../interfaces";
import { deleteUnusedLoadBalancers } from "../lib";

const router = express.Router();

router.post("/", async (req: Request, res) => {
  // @todo handle stray droplets + load balancers
  await deleteUnusedLoadBalancers();
  res.send("handle cleanup");
});

export default router;
