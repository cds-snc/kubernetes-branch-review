import { server } from "../server";
import request from "supertest";
import { eventJS } from "../__mocks__/";
import { createCluster } from "../create/createCluster";

jest.mock("../create/createCluster", () => ({
  createCluster: jest.fn(() => {
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

  expect(createCluster).toHaveBeenCalledTimes(1);
});
