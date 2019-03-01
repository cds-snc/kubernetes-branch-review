import { applyConfig } from "../lib/kubectl";
import { writeFile } from "fs";
require("child_process");

jest.mock("child_process", () => ({
  exec: jest.fn(),
  spawnSync: jest.fn()
}));

jest.mock("fs", () => ({
  writeFile: jest.fn()
}));

jest.mock("../lib/kubectl", () => {
  const actualLib = require.requireActual("../lib/kubectl");
  return {
    ...actualLib,
    execAsync: jest.fn()
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

  // it("returns false kustomize fails to build", async done => {
  //   writeFile.mockReturnValueOnce(true);
  //   execAsync.mockResolvedValueOnce(false);
  //   expect(await applyConfig(sha, overlayPath, config)).toEqual(false);
  //   done();
  // });

  // it("returns false kubectl fails to apply", async done => {
  //   writeFile.mockReturnValueOnce(true);
  //   execAsync.mockResolvedValueOnce(true);
  //   spawnSync.mockReturnValueOnce({ stderr: "Bad apply" });
  //   expect(await applyConfig(sha, overlayPath, config)).toEqual(false);
  //   done();
  // });

  // it("returns true if build and apply pass", async done => {
  //   writeFile.mockReturnValueOnce(true);
  //   execAsync.mockResolvedValueOnce(true);
  //   spawnSync.mockReturnValueOnce({ stderr: null });
  //   expect(await applyConfig(sha, overlayPath, config)).toEqual(true);
  //   done();
  // });
});
