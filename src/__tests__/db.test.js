import { saveReleaseToDB } from "../db/queries";
require("dotenv-safe").config({ allowEmptyValues: true });
test("throws error if bad options sent", async () => {
  try {
    await saveReleaseToDB();
  } catch (e) {
    expect(e.message).toEqual("no refId passed");
  }
});
