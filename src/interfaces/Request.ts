export interface RequestBody {
  action: string;
  repository: string;
  ref: string;
  after?:string
}

export interface Request {
  body: RequestBody;
}
