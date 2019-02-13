import express from "express";
import { homeRouter } from "./home";
const port = parseInt(process.env.PORT, 10) || 4000;
const server = express();

server.use("/", homeRouter);

server.listen(port, err => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});
