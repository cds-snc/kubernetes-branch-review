const { spawnSync } = require("child_process");
const DIR = process.env.CODE_DIR || "/tmp";

export const cleanup = (name: string): true => {
  const cleanup = spawnSync("rm", ["-rf", name], {
    cwd: DIR
  });

  if (cleanup.error && cleanup.error.toString()) {
    console.log(cleanup.error.toString());
  }

  return true;
};

const handleError = (p: { stderr?: string }) => {
  if (p && p.stderr && p.stderr.toString()) {
    console.log(p.stderr.toString());
    return false;
  }

  return true;
};

const clone = (fullName: string, sha: string): boolean => {
  const status = spawnSync(
    "git",
    ["clone", `https://github.com/${fullName}`, `${sha}`, "--quiet"],
    {
      cwd: DIR
    }
  );

  return handleError(status) === false ? false : true;
};

export const checkout = async (
  fullName: string,
  sha: string
): Promise<boolean> => {
  if (!cleanup(sha) || !clone(fullName, sha)) {
    return false;
  }

  const status = spawnSync("git", ["checkout", sha, "--quiet"], {
    cwd: `${DIR}/${sha}`
  });

  return handleError(status) === false ? false : true;
};
