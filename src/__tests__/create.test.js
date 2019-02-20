import { server } from "../server";
import request from "supertest";
import { eventJS } from "../__mocks__/";
import { create } from "../create/createCluster";

jest.mock("../create/createCluster", () => ({
  create: jest.fn(() => {
    return true;
  })
}));

test("returns 302 status code + hits create route", async () => {
  const event = await eventJS("create_a_pr");
  await request(server)
    .get("/")
    .send(event)
    .set("Content-Type", "application/json")
    .expect(200);

  expect(create).toHaveBeenCalledTimes(1);
});
