import express from "express";
import bodyParser from "body-parser";
import homeRouter from "./routes";

const defaultPort = parseInt(process.env.PORT, 10) || 4000;

export const server = express();

server.use(bodyParser.json());
server.use("/", homeRouter);
server.listen((port: number = defaultPort, err: Error) => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
