import express from "express";
import { create } from "../events/create";
import { update } from "../events/update";
import { close } from "../events/close";
import { deploy } from "../lib/deploy";
import { isMaster } from "../lib/isMaster";
import { getConfig } from "../api";
import { Logger, StackDriverNode } from "@cdssnc/logdriver";

Logger.subscribe("error", StackDriverNode.log);

// Logger.debug("=> The message from the server...");

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

router.get("/config/:id", async (req, res) => {
  const id = req.params.id;

  const result = await getConfig(id);
  console.log(result);
  res.send("hello");
});

export default router;
