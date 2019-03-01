import { eventJS } from "../__mocks__/";
import { getFullNameFromRefId, getRefId } from "../lib/getRefId";

const fullName = "cds-snc/etait-ici";
const repoName = `${fullName}/elenchos_demo`;

test("returns refId for create event", async () => {
  const result = getRefId({});
  expect(result).toEqual(false);
});

test("returns refId for create event", async () => {
  const event = await eventJS("create_a_pr");
  const result = getRefId(event);
  expect(result).toEqual(repoName);
});

test("returns refId for closed event", async () => {
  const event = await eventJS("closed_a_pr");
  const result = getRefId(event);
  expect(result).toEqual(repoName);
});

test("returns refId for initial push event", async () => {
  const event = await eventJS("push_to_intial_branch");
  const result = getRefId(event);
  expect(result).toEqual(repoName);
});

test("returns false for push to master", async () => {
  const event = await eventJS("push_to_master");
  const result = getRefId(event);
  expect(result).toEqual(false);
});

test("returns refId when pr is reopened", async () => {
  const event = await eventJS("reopen_a_pr");
  const result = getRefId(event);
  expect(result).toEqual(repoName);
});

test("returns refId when a branch is updated", async () => {
  const event = await eventJS("update_to_branch");
  const result = getRefId(event);
  expect(result).toEqual(repoName);
});

test("returns fullName", async () => {
  const event = await eventJS("update_to_branch");
  const result = getRefId(event);
  expect(result).toEqual(repoName);
});

test("getFullNameFromRefId returns the name of the repo", async () => {
  const event = await eventJS("update_to_branch");
  const result = getRefId(event);
  expect(getFullNameFromRefId(result)).toEqual(fullName);
});
