import express from "express";
import { update } from "../events/update";
import { close } from "../events/close";
import { Logger, StackDriverNode } from "@cdssnc/logdriver";
import { getRefId } from "../lib/getRefId";
import { deploy } from "../lib/deploy";
import { getRelease } from "../db/queries";
import { saveIpAndUpdate } from "../lib/saveIp";
import { getAction } from "../lib/getAction";

// import { create } from "../events/create";
import { checkAndCreateCluster } from "../lib/checkCluster";

Logger.subscribe("error", StackDriverNode.log);

// Logger.debug("=> The message from the server...");

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.post("/", async (req, res) => {
  const body = req.body;
  const action = getAction(req);
  const refId = getRefId(body);
  let status;

  if (!refId) {
    res.send("no refId found");
    return false;
  }

  let release = await getRelease({ refId });

  release = await checkAndCreateCluster(req, release);

  switch (action) {
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
      status = `default: ${action}`;
  }

  res.send(status);
});

export default router;
