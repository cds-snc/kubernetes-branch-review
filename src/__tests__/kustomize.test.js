import { editKustomization } from "../lib/kustomize";
import { getFile } from "../lib/getFile";
import { writeFile } from "fs";

jest.mock("../lib/getFile", () => ({
  getFile: jest.fn()
}));

jest.mock("fs", () => ({
  writeFile: jest.fn()
}));

const sha = "abcd";
const overlayPath = "foo";
const images = [{ name: "foo", newName: "bar" }];
const yaml = ` 
bases:
  - ../../base
`;

describe("editKustomization", () => {
  it("returns false if there is no config file", async () => {
    getFile.mockReturnValueOnce(null);
    expect(await editKustomization(sha, overlayPath, images)).toEqual(false);
  });

  it("returns false if there is a  config file but the write fails", async () => {
    getFile.mockReturnValueOnce(yaml);
    writeFile.mockImplementation(() => {
      throw new Error("Bad file");
    });
    expect(await editKustomization(sha, overlayPath, images)).toEqual(false);
  });

  it("returns true if there is a config file and it can write it out", async () => {
    getFile.mockReturnValueOnce(yaml);
    writeFile.mockReturnValueOnce(true);
    expect(await editKustomization(sha, overlayPath, images)).toEqual(true);
  });
});
