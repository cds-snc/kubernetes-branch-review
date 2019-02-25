import express from "express";
import { create } from "../events/create";
import { update } from "../events/update";
import { close } from "../events/close";
import { deploy } from "../lib/deploy";
import { buildAndPush } from "../lib/docker";
import { isMaster } from "../lib/isMaster";

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  const body = req.body;
  let action;
  let status;

  if (body.action) {
    // create
    // close
    // reopen
    action = body.action;
  } else {
    // get action from other type of event
    buildAndPush("cdssnc/etait-ici", ".", "etait-ici");
    if (!isMaster()) {
      action = "updated";
    }
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
