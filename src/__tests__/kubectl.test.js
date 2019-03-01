import { applyConfig } from "../lib/kubectl";
import { writeFile } from "fs";
const { spawnSync } = require("child_process");

jest.mock("child_process", () => ({
  spawnSync: jest.fn()
}));

jest.mock("fs", () => ({
  writeFile: jest.fn()
}));

const sha = "abcd";
const overlayPath = "foo";
const config = '{"foo": "bar"}';

describe("applyConfig", () => {
  it("returns false if config file write fails", () => {
    writeFile.mockImplementation(() => {
      throw new Error("Error");
    });
    expect(applyConfig(sha, overlayPath, config)).toEqual(false);
  });

  it("returns false kustomize fails to build", () => {
    writeFile.mockReturnValueOnce(true);
    spawnSync.mockReturnValueOnce({ stderr: "Bad build" });
    expect(applyConfig(sha, overlayPath, config)).toEqual(false);
  });

  it("returns false kubectl fails to apply", () => {
    writeFile.mockReturnValueOnce(true);
    spawnSync
      .mockReturnValueOnce({ stderr: null })
      .mockReturnValueOnce({ stderr: "Bad apply" });
    expect(applyConfig(sha, overlayPath, config)).toEqual(false);
  });

  it("returns true if build and apply pass", () => {
    writeFile.mockReturnValueOnce(true);
    spawnSync
      .mockReturnValueOnce({ stderr: null })
      .mockReturnValueOnce({ stderr: null });
    expect(applyConfig(sha, overlayPath, config)).toEqual(true);
  });
});
