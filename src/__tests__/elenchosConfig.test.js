import { elenchosConfig } from "../lib/deploy/elenchosConfig";
import { getFile } from "../lib/util/getFile";

jest.mock("../lib/util/getFile", () => ({
  getFile: jest.fn()
}));

describe("elenchosConfig", () => {
  it("returns false if there is no config file", async () => {
    getFile.mockReturnValueOnce(null);
    expect(await elenchosConfig("abcd")).toEqual(false);
  });

  it("returns false if there is a parsable config file but it is missing an overlay key", async () => {
    getFile.mockReturnValueOnce('{"dockefiles": []}');
    expect(await elenchosConfig("abcd")).toEqual(false);
  });

  it("returns false if there is a parsable config file but it is missing a dockerfiles key", async () => {
    getFile.mockReturnValueOnce('{"overlay": []}');
    expect(await elenchosConfig("abcd")).toEqual(false);
  });

  it("returns the config if there is a parsable config file is valid", async () => {
    getFile.mockReturnValueOnce('{"dockerfiles": [], "overlay": []}');
    expect(await elenchosConfig("abcd")).toEqual({
      dockerfiles: [],
      overlay: []
    });
  });
});
