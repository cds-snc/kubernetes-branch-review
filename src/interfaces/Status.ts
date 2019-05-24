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
}

export interface Status {
  owner?: string;

  repo?: string;

  sha?: string;
  /**
   * The state of the status. Can be one of `error`, `failure`, `pending`, or `success`.
   */
  state: "error" | "failure" | "pending" | "success";
  /**
   * The target URL to associate with this status. This URL will be linked from the GitHub UI to allow users to easily see the source of the status.  ,* For example, if your continuous integration system is posting build status, you would want to provide the deep link for the build output for this specific SHA:  ,* `http://ci.example.com/user/repo/build/sha`
   */
  target_url?: string;
  /**
   * A short description of the status.
   */
  description?: string;
  /**
   * A string label to differentiate this status from the status of other systems.
   */
  context?: string;
}
