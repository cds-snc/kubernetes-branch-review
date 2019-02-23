import { checkout } from "../lib/checkout";
const { spawnSync } = require("child_process");

describe("checkoutRepo", () => {
  it("returns false if the repo does not exist", async () => {
    expect(await checkout("foo", "abcd")).toEqual(false);
  });

  it("returns false if it is able to checkout the repo but the sha does not exist", async () => {
    expect(await checkout("cds-snc/dns", "abcd")).toEqual(false);
    spawnSync("rm", ["-rf", "dns"], {
      cwd: "/tmp"
    });
  });

  it("returns true if it is able to checkout the repo and the sha", async () => {
    expect(
      await checkout("cds-snc/dns", "686880e3ba2b2d782de57ff1540cdb00c7eb774a")
    ).toEqual(true);
    spawnSync("rm", ["-rf", "686880e3ba2b2d782de57ff1540cdb00c7eb774a"], {
      cwd: process.env.CODE_DIR
    });
  });
});
