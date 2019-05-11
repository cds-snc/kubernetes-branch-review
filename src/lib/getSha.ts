import { RequestBody } from "../interfaces/Request";

export const getSha = (event: RequestBody): string => {
  let sha;
  if (event.pull_request) {
    sha = event.pull_request.head.sha;
  } else {
    sha = event.after;
  }

  return sha;
};
