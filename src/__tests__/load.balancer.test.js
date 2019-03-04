import { getLoadBalancerIp } from "../lib/getLoadBalancer";

require("dotenv-safe").config({ allowEmptyValues: true });

test("can get load balancer from ipF", async () => {
  const droplets = await getLoadBalancerIp(
    "6852836d-d150-4187-be50-861c62b0ffe0"
  );

  console.log(droplets);

  // @todo mock api calls
  expect(true).toEqual(true);
});
