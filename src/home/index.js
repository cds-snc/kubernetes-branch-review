import express from "express";
import { createCluster } from "../create/createCluster";

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  const action = req.body.action;
  switch (action) {
    case "opened":
      const result = await createCluster(req);
      res.send(result);
      break;
    case "push":
      res.redirect("/push");
      break;
    default:
      res.send("no route found");
  }
});

export default router;
