import express from "express";
import { create } from "../events/create/";
import { update } from "../events/update";

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  const action = req.body.action;
  switch (action) {
    case "opened":
      const opened = await create(req);
      res.send(opened);
      break;
    case "push":
      const push = await update(req);
      res.send(push);
      break;
    default:
      res.send("no route found");
  }
});

export default router;
