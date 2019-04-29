enum PrState {
  NONE = "none",
  OPEN = "open",
  CLOSED = "closed"
}

enum ClusterState {
  none = "none",
  pending = "pending",
  queued = "queued",
  in_progress = "in_progress",
  running = "running",
  error = "error",
  failure = "failure",
  success = "success",
  deleted = "deleted"
}

export interface Release {
  refId: string;
  sha: string;
  cluster_id: string;
  pr_state: PrState;
  deployment_id: string;
  load_balancer_ip: string;
  config: string;
  branch: string;
  repo: string;
  cluster_state: ClusterState;
  timestamp: string;
  fullName: string;
}
