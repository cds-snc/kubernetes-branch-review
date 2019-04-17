import express from "express";
import { update } from "../events/update";
import { close } from "../events/close";
import { Logger, StackDriverNode } from "@cdssnc/logdriver";
import { getRefId } from "../lib/getRefId";
import { deploy } from "../lib/deploy";
import { getRelease } from "../db/queries";
import { isMaster } from "../lib/isMaster";
import { saveIpAndUpdate } from "../lib/saveIp";
import { create } from "../events/create";
//import {create} from "../li"
//import { checkAndCreateCluster } from "../lib/checkCluster";

Logger.subscribe("error", StackDriverNode.log);

// Logger.debug("=> The message from the server...");

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.post("/", async (req, res) => {
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

  if (!refId) {
    res.send("no refId found");
    return false;
  }

  let release = await getRelease({ refId });

  //console.log("release", release);

  //release = await checkAndCreateCluster(release);
  //console.log(cluster);
  //res.send("hey");

  //process.exit();

  // opened or updated
  // check to see if cluster exists
  // getCluster ... cluster_id

  /*

  "none",
        "pending",
        "queued",
        "in_progress",
        "error",
        "failure",
        "success",
        "deleted"

  */

  // Check if a cluster exists, if not create one vs. using opened or updated
  // the problem this is trying to fix is that a deployment may not be able to be created on "opened" if the checks fail

  // Also handle reopened action

  switch (action) {
    case "opened":
      release = await create(req, release);
      status = await deploy(release);
      await saveIpAndUpdate(req.body, release.sha, refId);
      break;
    case "updated":
      if (release) {
        status = await deploy(await update(req, release));
        await saveIpAndUpdate(req.body, release.sha, refId);
      } else {
        status = "no release found";
      }
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
