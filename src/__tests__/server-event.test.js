// tests need to be fixed to run worker code

import { server } from "../server";
import request from "supertest";
import { eventJS } from "../__mocks__";
// import { create } from "../events/create";
// import { update } from "../events/update";
import { close } from "../lib/close";
import { getRelease, getDeployment } from "../db/queries";
require("dotenv-safe").config({ allowEmptyValues: true });

// mock update deployment
jest.mock("../lib/github/githubNotify", () => ({
  updateDeploymentStatus: jest.fn(() => {
    return true;
  })
}));

jest.mock("../lib/github/githubStatus", () => ({
  updateStatus: jest.fn(() => {
    return true;
  })
}));

// mock create
/*
jest.mock("../events/create", () => ({
  create: jest.fn(() => {
    return true;
  })
}));
*/

// mock update
/*
jest.mock("../events/update", () => ({
  update: jest.fn(() => {
    return true;
  })
}));
*/

// mock close
jest.mock("../lib/close", () => ({
  close: jest.fn(() => {
    return true;
  })
}));

jest.mock("../lib/loadBalancer/saveIp", () => ({
  saveIpAndUpdate: jest.fn(() => {
    return true;
  })
}));

jest.mock("../db/queries", () => ({
  getDeployment: jest.fn(),
  getRelease: jest.fn()
}));

// closed event
test("returns 200 status code + calls close", async () => {
  const event = await eventJS("closed_a_pr");

  getDeployment.mockReturnValueOnce({
    ip: "123"
  });

  getRelease.mockReturnValueOnce({
    refId: "abcd",
    sha: "efgh",
    pr_state: "open",
    cluster_state: "running",
    cluster_id: "123"
  });

  await request(server)
    .post("/")
    .send(event)
    .set("X-GitHub-Event", "pull_request")
    .set("Content-Type", "application/json")
    .expect(200);
  expect(close).toHaveBeenCalledTimes(1);
});

// closed push event
test("returns 200 status code because it does not matter", async () => {
  const event = await eventJS("closed_push");

  getDeployment.mockReturnValueOnce({
    ip: "123"
  });

  getRelease.mockReturnValueOnce({
    refId: "abcd",
    sha: "efgh",
    pr_state: "open",
    cluster_state: "running",
    cluster_id: "123"
  });

  const result = await request(server)
    .post("/")
    .send(event)
    .set("X-GitHub-Event", "pull_request")
    .set("Content-Type", "application/json")
    .expect(200);

  expect(result.res.text).toEqual("Closing push ignored");
});

// no action event
test("returns 200 status code + with no ref", async () => {
  const event = { installation: { id: 123 } };
  getDeployment.mockReturnValueOnce({
    ip: "123"
  });

  const result = await request(server)
    .post("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);

  expect(result.res.text).toEqual("no refId found 🛑");
});
