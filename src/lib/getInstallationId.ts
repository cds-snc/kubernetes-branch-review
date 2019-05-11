import { RequestBody } from "../interfaces/Request";

export const getInstallationId = (event: RequestBody) => {
  if (!event || !event.installation || !event.installation.id) {
    const GITHUB_INSTALLATION_ID = process.env.GITHUB_INSTALLATION_ID;
    console.warn(
      `event.installation.id missing using ENV ${GITHUB_INSTALLATION_ID}`
    );
    return GITHUB_INSTALLATION_ID;
  }

  return event.installation.id;
};
