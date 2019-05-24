import express from "express";
import { close } from "../lib/close";
import { getRelease } from "../db/queries";
import { dbCanConnect } from "../db/canConnect";
import { getRefId } from "../lib/util/getRefId";
import { getAction } from "../lib/util/getAction";
import { returnStatus } from "../lib/util/returnStatus";
import { isBeforePr, beforePr } from "../lib/util/beforePr";
import { getVersion } from "../lib/util/getVersion";
import { handleEvent } from "../lib/util/handleEvent";
import { checkEnv } from "../lib/util/checkEnv";
import { noteError } from "../lib/util/note";
import { Worker, isMainThread } from "worker_threads";
import { ClusterWorker } from "../interfaces/ClusterWorker";
import { Request } from "../interfaces/Request";
import { Release } from "../interfaces/Release";
import { Response } from "express";

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

export const enforceRefId = (req: Request, res: Response) => {
  const body = req.body;
  const refId = getRefId(body);
  // do we have a refId?
  if (!refId) {
    let description = "no refId found 🛑";
    returnStatus(
      body,
      res,
      { state: "error", description },
      { state: "error", description }
    );

    throw new Error(description);
  }

  return refId;
};

const isClosingPush = (req: Request, res: Response) => {
  const body = req.body;

  // ignore closing push
  if (body.after && body.after === "0000000000000000000000000000000000000000") {
    returnStatus(
      body,
      res,
      {
        state: "success",
        description: "Closing push ignored"
      },
      {
        state: "inactive",
        description: "closed"
      }
    );

    return true;
  }

  return false;
};

const isClosedAction = async (req: Request, res: Response) => {
  const body = req.body;
  const action = getAction(req);
  // handle closed event
  if (action === "closed") {
    await close(req);
    returnStatus(
      body,
      res,
      {
        state: "success",
        description: "closed"
      },
      {
        state: "inactive",
        description: "closed"
      }
    );

    return true;
  }
};

const isCloseEvent = async (req: Request, res: Response) => {
  const closePush = isClosingPush(req, res);
  const closedAction = isClosedAction(req, res);

  if (closePush || closedAction) {
    return true;
  }

  return false;
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

  // hand off to Worker
  if (!closed && !beforePR && isMainThread && checkEnv()) {
    // stop existing worker + start a new worker
    if (refId && workers[refId]) {
      //@ts-ignore
      await terminate(workers[refId], refId);
    }

    //@ts-ignore
    workers[refId] = setupWorker({ body: req.body }, refId, release);
  }

  res.send(defaultMessage);
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
