import express from "express";
import bodyParser from "body-parser";
import homeRouter from "./home";
import createRouter from "./create";
import pushRouter from "./push";

const port = parseInt(process.env.PORT, 10) || 4000;
const server = express();

server.use(bodyParser.json());
server.use("/", homeRouter);
server.use("/create", createRouter);
server.use("/push", pushRouter);

server.listen(port, err => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
