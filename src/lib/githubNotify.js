import { authenticate } from "./githubAuth";

export const notify = async (
  event,
  status = { state: "pending", description: "Initializing deployment" }
) => {
  const client = await authenticate(event.installation.id);
  const repoOwner = event.repository.owner.name;
  const repoName = event.repository.name;

  const statusObj = Object.assign(
    {
      owner: repoOwner,
      repo: repoName,
      sha: event.after,
      context: "PR deploy"
    },
    status
  );

  const result = await client.repos.createStatus(statusObj);
  return result;
};
