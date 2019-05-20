import { applyConfig, execAsync } from "../lib/deploy/kubectl";
import { writeFile } from "fs";
const { spawnSync } = require("child_process");
require("util");

jest.mock("child_process", () => {
  const actualLib = require.requireActual("child_process");
  return {
    ...actualLib,
    spawnSync: jest.fn()
  };
});

jest.mock("fs", () => ({
  writeFile: jest.fn()
}));

jest.mock("util", () => ({
  promisify: () => jest.fn()
}));

jest.mock("../lib/deploy/kubectl", () => {
  const actualLib = require.requireActual("../lib/deploy/kubectl");
  return {
    ...actualLib,
    execAsync: jest.fn().mockResolvedValue("default")
  };
});

const sha = "abcd";
const overlayPath = "foo";
const config = '{"foo": "bar"}';

describe("applyConfig", () => {
  it("returns false if config file write fails", async done => {
    writeFile.mockImplementation(() => {
      throw new Error("Error");
    });
    expect(await applyConfig(sha, overlayPath, config)).toEqual(false);
    done();
  });

  it("returns false kubectl fails to apply", async done => {
    writeFile.mockReturnValueOnce(true);
    execAsync.mockReturnValueOnce(true);
    spawnSync.mockReturnValueOnce({ stderr: "Bad apply" });
    expect(await applyConfig(sha, overlayPath, config)).toEqual(false);
    done();
  });

  it("returns true if build and apply pass", async done => {
    writeFile.mockReturnValueOnce(true);
    execAsync.mockReturnValueOnce(true);
    spawnSync.mockReturnValueOnce({ stderr: null });
    expect(await applyConfig(sha, overlayPath, config)).toEqual(true);
    done();
  });
});
