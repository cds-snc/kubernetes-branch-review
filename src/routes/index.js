import express from "express";
import { create } from "../events/create";
import { update } from "../events/update";
import { close } from "../events/close";
import { deploy } from "../lib/deploy";

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  let action;
  let status;

  if (req.body.action) {
    // create
    // close
    action = req.body.action;
  } else {
    // get action from other type of event
  }

  switch (action) {
    case "opened":
      status = await deploy(await create(req));
      break;
    case "updated":
      status = await deploy(await update(req));
      break;
    case "closed":
      status = await close(req);
      break;
    default:
      status = "no route found";
  }

  res.send(status);
});

export default router;
