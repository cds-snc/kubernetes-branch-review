import express from "express";

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204));

router.get("/", async (req, res) => {
  // console.log("body", req.body);
  // res.send(req.body.action);

  const action = req.body.action;
  switch (action) {
    case "opened":
      res.redirect("/create");
      break;
    case "push":
      res.redirect("/push");
      break;
    default:
      res.send("");
  }
});

export default router;
