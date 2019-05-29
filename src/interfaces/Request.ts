export interface Head {
  ref: string;
  sha: string;
}
export interface PullRequest {
  head: Head;
}
export interface Repository {
  full_name: string;
  name: string;
  owner: { login: string };
}

export interface RequestBody {
  action: string;
  repository: Repository;
  ref: string;
  before?: string;
  after?: string;
  installation?: { id: string };
  pull_request?: PullRequest;
  check_run?: {
    conclusion: string;
    check_suite: {
      pull_requests: [{ head: { ref: string } }];
    };
  };
}

export interface Request {
  header: (name: string) => string;
  body: RequestBody;
}
