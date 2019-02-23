const { spawnSync } = require("child_process");
const DIR = process.env.CODE_DIR || "/tmp";

export const cleanup = name => {
  const cleanup = spawnSync("rm", ["-rf", name], {
    cwd: DIR
  });

  if (cleanup.error && cleanup.error.toString()) {
    console.log(cleanup.error.toString());
  }

  return true;
};

const clone = (fullName, sha) => {
  const clone = spawnSync(
    "git",
    ["clone", `https://github.com/${fullName}`, `${sha}`, "--quiet"],
    {
      cwd: DIR
    }
  );

  if (clone.stderr && clone.stderr.toString()) {
    console.log(clone.stderr.toString());
    return false;
  }

  return true;
};

export const checkout = async (fullName, sha) => {
  if (!cleanup(sha) || !clone(fullName, sha)) {
    return false;
  }

  const checkout = spawnSync("git", ["checkout", sha, "--quiet"], {
    cwd: `${DIR}/${sha}`
  });

  if (checkout.stderr && checkout.stderr.toString()) {
    console.log(checkout.stderr.toString());
    return false;
  }

  return true;
};
