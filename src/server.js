import express from "express";
import bodyParser from "body-parser";
import homeRouter from "./home";

const port = parseInt(process.env.PORT, 10) || 4000;

export const server = express();

server.use(bodyParser.json());
server.use("/", homeRouter);

server.listen(port, err => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
