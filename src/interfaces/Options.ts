export interface NodePools {
  size: string;
  count: number;
  name: string;
  tags: string[];
}

export interface Options {
  name: string;
  node_pools?: NodePools[];
  region?: string;
  version: string;
  tags?: string[];
  deployment_id?: string;
}
