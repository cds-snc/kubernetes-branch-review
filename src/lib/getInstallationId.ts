import { RequestBody } from "../interfaces/Request";

let warned = false;

export const getInstallationId = (event: RequestBody) => {
  if (!event || !event.installation || !event.installation.id) {
    const GITHUB_INSTALLATION_ID = process.env.GITHUB_INSTALLATION_ID;

    !warned && console.warn(`event.installation.id missing using ENV`);
    warned = true;
    return GITHUB_INSTALLATION_ID;
  }

  return event.installation.id;
};
