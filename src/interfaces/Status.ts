export interface StatusMessage {
  state: "error" | "failure" | "pending" | "success";
  description?: string;
  target_url?: string;
}

export interface DeploymentMessage {
  state:
    | "error"
    | "failure"
    | "inactive"
    | "in_progress"
    | "queued"
    | "pending"
    | "success";
  description?: string;
  target_url?: string;
  log_url?: string;
  environment_url?: string;
}
