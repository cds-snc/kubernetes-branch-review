import express from "express";
import { create } from "../events/create";
import { update } from "../events/update";
import { close } from "../events/close";
import { Logger, StackDriverNode } from "@cdssnc/logdriver";
import { getRefId } from "../lib/getRefId";
import { deploy } from "../lib/deploy";
import { getRelease } from "../db/queries";
import { isMaster } from "../lib/isMaster";
import { saveIpAndUpdate } from "../lib/saveIp";

Logger.subscribe("error", StackDriverNode.log);

// Logger.debug("=> The message from the server...");

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  const body = req.body;
  let status;
  /*
  let idTemp = getRefId(body);
  let releaseTemp = await getRelease({ refId: idTemp });

  await saveIpAndUpdate(req.body, releaseTemp.sha, idTemp);

  res.send("hey");
  return;
  */

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
      status = await deploy(release);
      await saveIpAndUpdate(req.body, release.sha, refId);
      break;
    case "updated":
      status = await deploy(await update(req, release));
      await saveIpAndUpdate(req.body, release.sha, refId);
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
