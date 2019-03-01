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

test("throws error if no sha", async () => {
  try {
    // repository.full_name
    await create({
      body: {
        action: "opened",
        repository: { full_name: "the_repo_name" },
        pull_request: { head: { ref: "1234" } }
      }
    });
  } catch (e) {
    console.log(e.message);
    expect(e.message).toEqual("sha or prState not defined");
  }
});
