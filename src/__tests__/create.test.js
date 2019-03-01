import { create } from "../events/create";

test("throws error if bad event sent", async () => {
  try {
    await create();
  } catch (e) {
    console.log(e.message);
    expect(e.message).toEqual("invalid event passed");
  }
});

test("throws error if bad event sent", async () => {
  try {
    await create({ body: {} });
  } catch (e) {
    console.log(e.message);
    expect(e.message).toEqual("refId not defined");
  }
});
