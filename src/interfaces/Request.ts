interface Repository {
  name: string;
  owner: { login: string };
}

interface PullRequest {
  head: { sha: "" };
}

export interface RequestBody {
  action: string;
  repository: Repository;
  ref: string;
  after?: string;
  installation: { id: string };
  pull_request: PullRequest;
}

export interface Request {
  body: RequestBody;
}
