import express from "express";
import { Request } from "../interfaces";
const router = express.Router();

router.post("/", async (req: Request, res) => {
  // @todo handle stray droplets + load balancers
  res.send("handle cleanup");
});

export default router;
