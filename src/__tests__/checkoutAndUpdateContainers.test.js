import { checkoutAndUpdateContainers } from "../lib/deploy/checkoutAndUpdateContainers";
import { applyConfig } from "../lib/deploy/kubectl";
import { buildAndPush } from "../lib/deploy/docker";
import { editKustomization } from "../lib/deploy/kustomize";
import { elenchosConfig } from "../lib/deploy/elenchosConfig";
import { checkout } from "../lib/git";

jest.mock("../lib/deploy/kubectl", () => ({
  applyConfig: jest.fn()
}));

jest.mock("../lib/deploy/docker", () => ({
  buildAndPush: jest.fn()
}));

jest.mock("../lib/deploy/kustomize", () => ({
  editKustomization: jest.fn()
}));

jest.mock("../lib/deploy/elenchosConfig", () => ({
  elenchosConfig: jest.fn()
}));

jest.mock("../lib/git", () => ({
  checkout: jest.fn()
}));

const release = {
  refId: "cds-snc/elenchos",
  sha: "abcd",
  config: `
bases:
  - ../../base
`
};

describe("deploy", () => {
  it("returns false if cannot checkout the git repo", async () => {
    checkout.mockReturnValueOnce(false);
    expect(await checkoutAndUpdateContainers(release)).toEqual(false);
  });

  it("returns false if cannot parse the elenchos config", async () => {
    checkout.mockReturnValueOnce(true);
    elenchosConfig.mockReturnValueOnce(false);
    expect(await checkoutAndUpdateContainers(release)).toEqual(false);
  });

  it("returns false if cannot update the kustomize file", async () => {
    checkout.mockReturnValueOnce(true);
    elenchosConfig.mockReturnValueOnce({
      dockerfiles: { foo: "bar" },
      overlay: "abcd"
    });
    buildAndPush.mockReturnValueOnce("foo:abcd");
    editKustomization.mockReturnValueOnce(false);
    expect(await checkoutAndUpdateContainers(release)).toEqual(false);
  });

  it("returns false if cannot apply kubernetes configuration", async () => {
    checkout.mockReturnValueOnce(true);
    elenchosConfig.mockReturnValueOnce({
      dockerfiles: { foo: "bar" },
      overlay: "abcd"
    });
    buildAndPush.mockReturnValueOnce("foo:abcd");
    editKustomization.mockReturnValueOnce(true);
    applyConfig.mockReturnValueOnce(false);
    expect(await checkoutAndUpdateContainers(release)).toEqual(false);
  });

  it("returns true if it passes all the steps to deploy", async () => {
    checkout.mockReturnValueOnce(true);
    elenchosConfig.mockReturnValueOnce({
      dockerfiles: { foo: "bar" },
      overlay: "abcd"
    });
    buildAndPush.mockReturnValueOnce("foo:abcd");
    editKustomization.mockReturnValueOnce(true);
    applyConfig.mockReturnValueOnce(true);
    expect(await checkoutAndUpdateContainers(release)).toEqual(true);
  });
});
