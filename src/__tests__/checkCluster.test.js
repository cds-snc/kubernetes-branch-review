import { checkAndCreateCluster } from "../lib/checkCluster";
import { deleteDropletByTag, getCluster } from "../api/";
import { create } from "../events/create";

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

test("returns false if no release exists", async () => {
  const result = await checkAndCreateCluster(req);
  expect(result).toEqual(false);
});

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
