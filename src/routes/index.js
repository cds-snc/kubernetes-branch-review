import express from "express";
import { create } from "../events/create";
import { update } from "../events/update";
import { close } from "../events/close";

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  const action = req.body.action;
  switch (action) {
    case "opened":
      const opened = await create(req);
      res.send(opened);
      break;
    case "updated":
      const updated = await update(req);
      res.send(updated);
      break;
    case "closed":
      const closed = await close(req);
      res.send(closed);
      break;
    default:
      res.send("no route found");
  }
});

export default router;
