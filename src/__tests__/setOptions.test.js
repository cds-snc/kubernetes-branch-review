import { defaultOptions, setOptions } from "../lib/setOptions";

test.skip("returns refId for create event", async () => {
  const result = setOptions({ name: "hello" });
  console.log(result);
  expect(result).toEqual(defaultOptions);
});
