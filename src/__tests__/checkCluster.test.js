import { checkAndCreateCluster } from "../lib/checkCluster";
import { deleteDropletByTag, getCluster } from "../api/";
import { create } from "../events/create";
import { eventJS } from "../__mocks__";

const req = {
  body: {
    action: "opened",
    repository: { full_name: "the_repo_name" },
    pull_request: { head: { ref: "1234" } }
  }
};

// Todo: Add tests for

// initial push
// create PR
// additional push
// close PR
// re-open pr
// push

jest.mock("../events/create", () => ({
  create: jest.fn()
}));

jest.mock("../api", () => ({
  getCluster: jest.fn(),
  deleteDropletByTag: jest.fn(() => {
    return { kubernetes_cluster: { id: "123" } };
  })
}));

test("checks and creates cluster if it doesn't exist", async () => {
  await checkAndCreateCluster(req, { refId: 123, cluster_state: "pending" });
  expect(deleteDropletByTag).toHaveBeenCalledTimes(1);
});

test("calls get cluster to see if it's running", async () => {
  getCluster.mockReturnValueOnce({
    kubernetes_cluster: { id: "123", state: "pending" }
  });

  await checkAndCreateCluster(req, {
    refId: 123,
    cluster_state: "pending",
    cluster_id: 4
  });

  expect(getCluster).toHaveBeenCalledTimes(1);
  expect(deleteDropletByTag).toHaveBeenCalledTimes(1);
  expect(create).toHaveBeenCalledTimes(1);
});

test("create a PR", async () => {
  const event = await eventJS("create_a_pr");
  req.body = event;
  await checkAndCreateCluster(req, {
    refId: "abcd",
    sha: "efgh",
    pr_state: "none"
  });
  expect(create).toHaveBeenCalledTimes(1);
  expect(deleteDropletByTag).toHaveBeenCalledTimes(0);
});

test("update to branch on running", async () => {
  const event = await eventJS("update_to_branch");
  req.body = event;
  await checkAndCreateCluster(req, {
    refId: "abcd",
    sha: "efgh",
    pr_state: "open",
    cluster_state: "running",
    cluster_id: "ijkl"
  });
  expect(create).toHaveBeenCalledTimes(0);
  expect(deleteDropletByTag).toHaveBeenCalledTimes(0);
});

test("update to branch on no cluster id", async () => {
  const event = await eventJS("update_to_branch");
  req.body = event;
  await checkAndCreateCluster(req, {
    refId: "abcd",
    sha: "efgh",
    pr_state: "open",
    cluster_state: "pending"
  });
  expect(deleteDropletByTag).toHaveBeenCalledTimes(1);
  expect(create).toHaveBeenCalledTimes(1);
});

test("update to branch on no running cluster", async () => {
  const event = await eventJS("update_to_branch");
  req.body = event;
  getCluster.mockReturnValueOnce({
    kubernetes_cluster: { id: "123", state: "failure" }
  });
  await checkAndCreateCluster(req, {
    refId: "abcd",
    sha: "efgh",
    pr_state: "open",
    cluster_state: "running",
    cluster_id: "123"
  });
  expect(deleteDropletByTag).toHaveBeenCalledTimes(1);
  expect(create).toHaveBeenCalledTimes(1);
});

test("close pr event gets sent", async () => {
  const event = await eventJS("closed_a_pr");
  req.body = event;
  await checkAndCreateCluster(req, {
    refId: "abcd",
    sha: "efgh",
    pr_state: "open",
    cluster_state: "running",
    cluster_id: "123"
  });
  expect(deleteDropletByTag).toHaveBeenCalledTimes(0);
  expect(create).toHaveBeenCalledTimes(0);
});

test("reopen pr event gets sent", async () => {
  const event = await eventJS("reopen_a_pr");
  req.body = event;
  await checkAndCreateCluster(req, {
    refId: "abcd",
    sha: "efgh",
    pr_state: "closed",
    cluster_state: "deleted",
    cluster_id: "null"
  });
  expect(deleteDropletByTag).toHaveBeenCalledTimes(0);
  expect(create).toHaveBeenCalledTimes(1);
});
