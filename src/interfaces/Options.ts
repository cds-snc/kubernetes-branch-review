export interface NodePools {
  size: string;
  count: number;
  name: string;
  tags: string[];
}

export interface Options {
  name: string;
  region: string;
  version: string;
  tags: string[];
  node_pools: NodePools[];
}
