import express from "express";
import { close } from "../events/close";
import { getRelease } from "../db/queries";
import { dbConnect } from "../db/connect";
import { getRefId } from "../lib/util/getRefId";
import { getAction, isBeforePr } from "../lib/util/getAction";
import { returnStatus } from "../lib/util/returnStatus";
import { beforePr } from "../lib/cluster/checkCluster";
import { getVersion } from "../lib/util/getVersion";
import { handleEvent } from "../lib/util/handleEvent";
import { Worker, isMainThread } from "worker_threads";
import { ClusterWorker } from "../interfaces/ClusterWorker";
import { Release } from "../interfaces/Release";
import { Request } from "../interfaces/Request";

let workers: ClusterWorker = {};

// terminate worker
const terminate = async (worker: Worker, refId: string): Promise<void> => {
  console.log(`terminate worker for refId: ${refId}`);
  worker.terminate((err: Error, code: number) => {
    console.log("index.ts => exit code", code);
    delete workers[refId];
  });
};

//  https://nodejs.org/api/worker_threads.html
const setupWorker = (req: Request, refId: string, release: Release): Worker => {
  // can init and send data
  console.log(`setup worker for refId ${refId}`);

  const w = new Worker("./worker.js", {
    workerData: { req, refId, release }
  });

  w.on("message", e => {
    terminate(w, refId);
  });

  return w;
};

const router = express.Router();

const checkEnv = () => {
  if (process.env.NODE_ENV === "test") {
    // don't spin up for test env
    // @todo see if there's a way to test worker process using jest
    return false;
  }

  return true;
};

router.get("/favicon.ico", (req, res) => res.status(204));

router.post("/", async (req: Request, res) => {
  const body = req.body;

  // do we have a database connection?
  const db = await dbConnect();
  if (!db) {
    // @todo notify github
    let status = "database connection error 🛑";
    return returnStatus(body, res, { state: "error", description: status });
  }

  const action = getAction(req);
  const refId = getRefId(body);
  const eventInfo = handleEvent(req);

  // do we have a refId?
  if (!refId) {
    let status = "no refId found 🛑";
    return returnStatus(body, res, { state: "error", description: status });
  }

  if (!eventInfo.handleEvent) {
    res.send(`✅ event ignored ${eventInfo.type}`);
    return;
  }

  let release = await getRelease({ refId });

  if (body.after && body.after === "0000000000000000000000000000000000000000") {
    return returnStatus(body, res, {
      state: "success",
      description: "Closing push ignored"
    });
  }

  if (action === "closed") {
    await close(req);
    return returnStatus(body, res, {
      state: "success",
      description: "Branch review app removed"
    });
  }

  // hand off to Worker
  if (isMainThread && checkEnv()) {
    if (isBeforePr(req)) {
      beforePr(req);
    } else {
      // stop existing worker + start a new worker
      if (refId && workers[refId]) {
        //@ts-ignore
        await terminate(workers[refId], refId);
      }

      //@ts-ignore
      workers[refId] = setupWorker({ body: req.body }, refId, release);
    }
  }

  const version = getVersion();

  console.log(
    `✅ event: ${eventInfo.type}  ✅ refId: ${refId} ✅ v: ${version}`
  );

  res.send("✅ event received");
});

export default router;
