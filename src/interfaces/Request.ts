export interface RequestBody {
  action: string;
  repository: string;
  ref: string;
}

export interface Request {
  body: RequestBody;
}
