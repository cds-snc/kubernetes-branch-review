import express, { Response } from "express";
import {
  getVersion,
  handleEvent,
  checkEnv,
  noteError,
  enforceRefId,
  isCloseEvent,
  isBeforePr,
  beforePr,
  getRelease,
  dbCanConnect,
  isFailedCheckRun
} from "../lib";
import { ClusterWorker, Request, Release } from "../interfaces";
import { Worker, isMainThread } from "worker_threads";

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
export const setupWorker = (
  req: Request,
  refId: string,
  release: Release
): Worker => {
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

const isBeforePrEvent = async (req: Request, res: Response) => {
  const defaultMessage = "✅ event received";
  let beforePR = false;

  // handle events before a PR
  if (isBeforePr(req)) {
    await beforePr(req);
    res.send(defaultMessage);
    beforePR = true;
  }

  return beforePR;
};

export const main = async (req: Request, res: Response) => {
  const refId = enforceRefId(req, res);
  const eventInfo = handleEvent(req);
  const defaultMessage = "✅ event received";

  await dbCanConnect(req, res);

  // check if we want to handle this type of event
  if (!eventInfo.handleEvent) {
    res.send(`✅ event ignored ${eventInfo.type}`);
    return;
  }

  console.log(`✅ version: ${getVersion()}`);
  console.log(`✅ event: ${eventInfo.type}  ✅ refId: ${refId} `);

  const closed = await isCloseEvent(req, res);
  const beforePR = await isBeforePrEvent(req, res);

  // handle deployment
  let release = await getRelease({ refId });

  const failedRun = await isFailedCheckRun(req, refId);

  if (failedRun) {
    res.send(`❌failed check run`);
    return;
  }

  // hand off to Worker
  if (!closed && !beforePR && isMainThread && checkEnv()) {
    // stop existing worker + start a new worker
    if (refId && workers[refId]) {
      //@ts-ignore
      await terminate(workers[refId], refId);
    }

    res.send(defaultMessage);

    //@ts-ignore
    workers[refId] = setupWorker({ body: req.body }, refId, release);
  }

  // if not res send ??
};

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.post("/", async (req: Request, res) => {
  try {
    await main(req, res);
  } catch (e) {
    noteError(`deploy ${e.message}`, e);
  }
});

export default router;
