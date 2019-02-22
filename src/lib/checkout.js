const { spawnSync } = require("child_process");
const DIR = process.env.CODE_DIR || "/code";

export const cleanup = name => {
  const cleanup = spawnSync("rm", ["-rf", name], {
    cwd: DIR
  });

  if (cleanup.error && cleanup.error.toString()) {
    console.log(cleanup.error.toString());
  }

  return true;
};

const clone = fullName => {
  const clone = spawnSync(
    "git",
    ["clone", `https://github.com/${fullName}`, "--quiet"],
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
  const name = fullName.split("/")[1];

  if (!cleanup(name) || !clone(fullName)) {
    return false;
  }

  const checkout = spawnSync("git", ["checkout", sha, "--quiet"], {
    cwd: `${DIR}/${name}`
  });

  if (checkout.stderr && checkout.stderr.toString()) {
    console.log(checkout.stderr.toString());
    return false;
  }

  return true;
};
