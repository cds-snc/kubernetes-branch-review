import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import { handleEvent } from "../lib/handleEvent";

const port = parseInt(process.env.PORT, 10) || 5000;

export const server = express();

server.use(bodyParser.json());

server.post("/", async (req, res) => {
  const result = handleEvent(req);
  res.send(result.handleEvent);
});

server.listen(port, err => {
  if (err) throw err;
  console.log(`> Ready on http://localhost:${port}`);
});

test("return true for a pull request", async () => {
  const result = await request(server)
    .post("/")
    .send({})
    .set("X-GitHub-Event", "pull_request")
    .expect(200);

  expect(result.res.text).toEqual("true");
});

test("return false for a deployment", async () => {
  const result = await request(server)
    .post("/")
    .send({})
    .set("X-GitHub-Event", "deployment")
    .expect(200);

  expect(result.res.text).toEqual("false");
});

test("return false for a status", async () => {
  const result = await request(server)
    .post("/")
    .send({})
    .set("X-GitHub-Event", "status")
    .expect(200);

  expect(result.res.text).toEqual("false");
});

test("return true for a delete", async () => {
  const result = await request(server)
    .post("/")
    .send({})
    .set("X-GitHub-Event", "delete")
    .expect(200);

  expect(result.res.text).toEqual("true");
});

test("return true for a create", async () => {
  const result = await request(server)
    .post("/")
    .send({})
    .set("X-GitHub-Event", "create")
    .expect(200);

  expect(result.res.text).toEqual("true");
});

test("return true for a push", async () => {
  const result = await request(server)
    .post("/")
    .send({})
    .set("X-GitHub-Event", "push")
    .expect(200);

  expect(result.res.text).toEqual("true");
});
