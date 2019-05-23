import express from "express";
import bodyParser from "body-parser";
import homeRouter from "./routes";

const port = parseInt(process.env.PORT, 10) || 4000;

export const server = express();

server.use(bodyParser.json());
server.use("/", homeRouter);

server.listen(port, () => {
  console.log(`> Ready on http://localhost:${port}`);
});
