import { buildAndPush } from "../lib/docker";
const { spawnSync } = require("child_process");

jest.mock("child_process", () => ({
  spawnSync: jest.fn()
}));

describe("buildAndPush", () => {
  it("returns false if the build fails", () => {
    spawnSync.mockReturnValueOnce({ stderr: "Bad build" });
    expect(buildAndPush("cds-snc/dns", "abcd", "efgh")).toEqual(false);
  });

  it("returns false if the push fails", () => {
    spawnSync
      .mockReturnValueOnce({ stderr: null })
      .mockReturnValueOnce({ stderr: "Bad push" });
    expect(buildAndPush("cds-snc/dns", "abcd", "efgh")).toEqual(false);
  });

  it("returns the image name if build and push pass", () => {
    spawnSync
      .mockReturnValueOnce({ stderr: null })
      .mockReturnValueOnce({ stderr: null });
    expect(buildAndPush("cds-snc/dns", "abcd", "efgh")).toEqual(
      "gcr.io/elenchos/cds-snc/dns:efgh"
    );
  });
});
