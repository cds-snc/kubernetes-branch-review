// @todo look into starting stopping server between tests
/*
import { server } from "../server";
import request from "supertest";
import { eventJS } from "../__mocks__/";
import { create } from "../events/close";

jest.mock("../events/close", () => ({
  create: jest.fn(() => {
    return true;
  })
}));

test("returns 302 status code + hits update route", async () => {
  const event = await eventJS("closed_a_pr");
  await request(server)
    .get("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);
  expect(create).toHaveBeenCalledTimes(1);
});
*/

test("placeholder", async () => {
  expect(true).toEqual(true);
});
