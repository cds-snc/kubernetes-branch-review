import request from "supertest";
import express from "express";
import createRouter from "../create";
import bodyParser from "body-parser";
import { eventJS } from "../__mocks__/";

const port = parseInt(process.env.PORT, 10) || 4000;
const server = express();

server.use(bodyParser.json());
server.use("/create", createRouter);

server.listen(port, err => {
  if (err) throw err;
});

test("returns 200 status code", async () => {
  const event = await eventJS("create_a_pr");
  const res = await request(server)
    .get("/create")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);

  expect(res.text).toEqual("create");
});
