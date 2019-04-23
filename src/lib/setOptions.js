export const defaultOptions = {
  name: "stage-cluster-01",
  region: "nyc1",
  version: "1.12.1-do.2",
  tags: ["stage"],
  node_pools: [
    {
      size: "s-1vcpu-2gb",
      count: 1,
      name: "frontend-pool",
      tags: ["frontend"]
    }
  ]
};

export const setOptions = options => {
  const clusterOptions = Object.assign({}, defaultOptions, {
    ...options
  });

  if (options.name) {
    const tags = clusterOptions.node_pools[0].tags;
    clusterOptions.node_pools[0].name = options.name;
    clusterOptions.node_pools[0].tags = [...tags, options.name];
  }

  return clusterOptions;
};
