import { server } from "../server";
import request from "supertest";
import { eventJS } from "../__mocks__";
import { create } from "../events/create";
import { update } from "../events/update";
import { close } from "../events/close";
import { getRelease, getDeployment } from "../db/queries";
require("dotenv-safe").config({ allowEmptyValues: true });

// mock update deployment
jest.mock("../lib/githubNotify", () => ({
  updateDeploymentStatus: jest.fn(() => {
    return true;
  })
}));

jest.mock("../lib/githubStatus", () => ({
  updateStatus: jest.fn(() => {
    return true;
  })
}));

// mock create
jest.mock("../events/create", () => ({
  create: jest.fn(() => {
    return true;
  })
}));

// mock update
jest.mock("../events/update", () => ({
  update: jest.fn(() => {
    return true;
  })
}));

// mock close
jest.mock("../events/close", () => ({
  close: jest.fn(() => {
    return true;
  })
}));

jest.mock("../lib/saveIp", () => ({
  saveIpAndUpdate: jest.fn(() => {
    return true;
  })
}));

jest.mock("../db/queries", () => ({
  getDeployment: jest.fn(),
  getRelease: jest.fn()
}));

// create event
test.skip("returns 200 status code + calls create", async () => {
  const event = await eventJS("create_a_pr");

  getDeployment.mockReturnValueOnce({
    ip: "123"
  });

  getRelease.mockReturnValueOnce({
    refId: "abcd",
    sha: "efgh",
    pr_state: "none"
  });

  await request(server)
    .post("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);

  expect(create).toHaveBeenCalledTimes(1);
});

// update event
test.skip("returns 200 status code + calls update", async () => {
  getDeployment.mockReturnValueOnce({
    ip: "123"
  });

  getRelease.mockReturnValueOnce({
    refId: "abcd",
    sha: "efgh",
    pr_state: "open",
    cluster_state: "running",
    cluster_id: "ijkl"
  });

  const event = await eventJS("update_to_branch");
  await request(server)
    .post("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);

  expect(getRelease).toHaveBeenCalledTimes(1);
  expect(update).toHaveBeenCalledTimes(1);
  //
});

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
