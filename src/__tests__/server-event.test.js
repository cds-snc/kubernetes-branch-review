import { server } from "../server";
import request from "supertest";
import { eventJS } from "../__mocks__";
import { create } from "../events/create";
import { update } from "../events/update";
import { close } from "../events/close";
require("dotenv-safe").config({ allowEmptyValues: true });

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

// create event
test("returns 302 status code + hits create route", async () => {
  const event = await eventJS("create_a_pr");
  await request(server)
    .post("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);

  expect(create).toHaveBeenCalledTimes(1);
});

// update event
test("returns 302 status code + hits update route", async () => {
  const event = await eventJS("update_to_branch");
  await request(server)
    .post("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);

  expect(update).toHaveBeenCalledTimes(1);
});

// closed event
test("returns 302 status code + hits update route", async () => {
  const event = await eventJS("closed_a_pr");
  await request(server)
    .post("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);
  expect(close).toHaveBeenCalledTimes(1);
});

// no action event
test("returns 302 status code + hits update route", async () => {
  const event = {};
  const result = await request(server)
    .post("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);

  expect(result.res.text).toEqual("no refId found");
});
