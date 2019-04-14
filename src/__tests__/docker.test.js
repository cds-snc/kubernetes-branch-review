import { buildAndPush } from "../lib/docker";
const { spawnSync } = require("child_process");

jest.mock("child_process", () => ({
  spawnSync: jest.fn()
}));

describe("buildAndPush", () => {
  it("returns the image name if build and push pass", () => {
    spawnSync.mockReturnValueOnce({ stderr: null });
    expect(buildAndPush("cds-snc/dns", "abcd", "efgh")).toEqual(
      "gcr.io/elenchos-registry/cds-snc/dns:efgh"
    );
  });
});
