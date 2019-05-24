import path from "path";
import { getFile } from "../util/getFile";
import { App } from "@octokit/app";
const Octokit = require("@octokit/rest");

require("dotenv-safe").config({ allowEmptyValues: true });

const GITHUB_PEM = process.env.PEM;
const ISSUER_ID = Number(process.env.ISSUER_ID);

const getKey = async (): Promise<string> => {
  const file = path.resolve(__dirname, `../../../${GITHUB_PEM}`);
  const result = await getFile(file);
  return result.toString("utf8");
};

export const authenticate = async (installationId: string): Promise<any> => {
  const app = new App({
    id: ISSUER_ID,
    privateKey: await getKey()
  });

  const installationAccessToken = await app.getInstallationAccessToken({
    installationId: Number(installationId)
  });

  const octokit = new Octokit({
    auth: `token ${installationAccessToken}`,
    previews: ["ant-man-preview", "flash-preview"]
  });

  return octokit;
};
