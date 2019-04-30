export interface Head {
  ref: string;
}

export interface PullRequest {
  head: Head;
}

export interface Repository {
  full_name: string;
}

export interface RequestBody {
  action: string;
  repository: Repository;
  ref: string;
  after?:string;
  pull_request: PullRequest;
}

export interface Request {
  body: RequestBody;
}
