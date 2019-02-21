// @todo look into starting stopping server between tests
/*
import { server } from "../server";
import request from "supertest";
import { eventJS } from "../__mocks__/";
import { create } from "../events/update";

jest.mock("../events/update", () => ({
  create: jest.fn(() => {
    return true;
  })
}));

test("returns 302 status code + hits update route", async () => {
  const event = await eventJS("update_to_branch");
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
