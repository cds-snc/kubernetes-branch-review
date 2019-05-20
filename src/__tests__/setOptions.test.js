import { setOptions } from "../lib/util/setOptions";

test("returns refId for create event", async () => {
  const name = "the-pr-name";
  const result = setOptions({ name });
  expect(result.name).toEqual(name);
  expect(result.node_pools[0].tags).toContain(name);
});
