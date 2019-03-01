import express from "express";
import { create } from "../events/create";
import { update } from "../events/update";
import { close } from "../events/close";
import { getRefId } from "../lib/getRefId";
import { deploy } from "../lib/deploy";
import { getRelease } from "../db/queries";
import { isMaster } from "../lib/isMaster";
import { Logger, StackDriverNode } from "@cdssnc/logdriver";

Logger.subscribe("error", StackDriverNode.log);

// Logger.debug("=> The message from the server...");

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  const body = req.body;
  let status;

  let action;

  if (body.action) {
    // create
    // close
    // reopen
    action = body.action;
  } else {
    // get action from other type of event
    if (!isMaster() && body.repository) {
      action = "updated";
    }
  }

  const refId = getRefId(body);
  let release = await getRelease({ refId });

  switch (action) {
    case "opened":
      release = await create(req, release);
      // status = await deploy(release);
      break;
    case "updated":
      status = await deploy(await update(req, release));
      break;
    case "closed":
      status = await close(req, release);
      break;
    default:
      status = "no route found";
  }

  res.send(status);
});

export default router;
