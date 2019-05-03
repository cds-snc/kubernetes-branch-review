export interface Node {
    name: string; 
  }

export interface NodePools {
    nodes: Node[];
}

export interface Status {
    state: string;
}

export interface Cluster {
    id: string;
    node_pools: NodePools[];
    status: Status;
    state: string;
  }