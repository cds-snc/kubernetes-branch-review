import express from "express";
import { update } from "../events/update";
import { close } from "../events/close";
import { Logger, StackDriverNode } from "@cdssnc/logdriver";
import { getRefId } from "../lib/getRefId";
import { deploy } from "../lib/deploy";
import { getRelease } from "../db/queries";
import { dbConnect } from "../db/connect";
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

  // do we have a database connection?
  const db = await dbConnect();
  if (!db) {
    // @todo notify github
    res.send("database connection error 🛑");
    return;
  }

  const action = getAction(req);
  const refId = getRefId(body);
  let status;

  // do we have a refId?
  if (!refId) {
    // @todo notify github
    res.send("no refId found 🛑");
    return;
  }

  let release = await getRelease({ refId });
  console.log("release:", release);

  if (action === "closed") {
    status = await close(req, release);
    // @todo notify github
    res.send(status);
    return;
  }

  release = await checkAndCreateCluster(req, release);
  console.log("release:", release);

  if (release) {
    status = await deploy(await update(req, release));
    await saveIpAndUpdate(req.body, release.sha, refId);
  } else {
    status = "no release found";
  }
  // @todo notify github
  res.send(status);
});

export default router;
