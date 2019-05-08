import express from "express";
import { close } from "../events/close";
import { getRelease } from "../db/queries";
import { dbConnect } from "../db/connect";
import { getRefId } from "../lib/getRefId";
import { getAction } from "../lib/getAction";
import { returnStatus } from "../lib/returnStatus";
import { deployRelease } from "../lib/deployRelease";

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.post("/", async (req, res) => {
  const body = req.body;
  let status;

  // do we have a database connection?
  const db = await dbConnect();
  if (!db) {
    // @todo notify github
    status = "database connection error 🛑";
    return returnStatus(body, res, { state: "error", description: status });
  }

  const action = getAction(req);
  const refId = getRefId(body);

  // do we have a refId?
  if (!refId) {
    status = "no refId found 🛑";
    return returnStatus(body, res, { state: "error", description: status });
  }

  let release = await getRelease({ refId });
  console.log("release:", release);

  if (body.after && body.after === "0000000000000000000000000000000000000000") {
    return returnStatus(body, res, {
      state: "success",
      description: "Closing push ignored"
    });
  }

  if (action === "closed" && release) {
    status = await close(req, release);
    return returnStatus(body, res, {
      state: "success",
      description: "Branch review app removed"
    });
  }

  const deployStatus = await deployRelease(req, refId, release);

  if (deployStatus && typeof deployStatus === "object") {
    return returnStatus(body, res, deployStatus);
  }

  return returnStatus(body, res, {
    state: "error",
    description: "no release found"
  });
});

export default router;
