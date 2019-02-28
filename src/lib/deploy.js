import { applyConfig } from "./kubectl";
import { buildAndPush } from "./docker";
import { editKustomization } from "./kustomize";
import { elenchosConfig } from "./elenchosConfig";
import { checkout } from "./git";

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index]);
  }
}

export const deploy = async release => {
  let fullName, refId, sha, config, dockerfiles, overlay;
  ({ fullName, refId, sha, config } = release);

  // Checkout the code
  if (!(await checkout(fullName, sha))) {
    console.error(`Could not checkout repo ${refId}`);
    return false;
  }

  // Parse the repo specific config file
  ({ dockerfiles, overlay } = await elenchosConfig(sha));

  if (!dockerfiles || !overlay) {
    console.error(`Could not get repo config ${refId}`);
    return false;
  }

  // Build all the modified docker images
  let images = [];
  asyncForEach(Object.keys(dockerfiles), async dockerfile => {
    const newName = await buildAndPush(
      dockerfile,
      dockerfiles[dockerfile],
      sha
    );
    if (!newName) {
      console.error(`Could not build ${dockerfile}`);
    } else {
      images.push({ name: dockerfile, newName: newName });
    }
  });

  // Update the kustomize file
  if (!(await editKustomization(sha, overlay, images))) {
    console.error("Could not edit kustomize file");
    return false;
  }

  // Apply the kubernetes configuration
  if (!applyConfig(sha, overlay, config)) {
    console.error("Could not apply kubectl config");
    return false;
  }
  return true;
};
