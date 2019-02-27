import { buildAndPush } from "./docker";
import { editKustomization } from "./kustomize";
import { elenchosConfig } from "./elenchosConfig";
import { checkout } from "./git";

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export const deploy = async (req, release) => {
  let refId, sha, config, dockerfiles, overlay;
  ({ refId, sha, config } = release);

  // Checkout the code
  await checkout(refId, sha);

  // Parse the repo specific config file
  ({ dockerfiles, overlay } = await elenchosConfig(sha));

  // Build all the modified docker images
  let images = [];
  asyncForEach(Object.keys(dockerfiles), async dockerfile => {
    const newName = await buildAndPush(
      dockerfile,
      dockerfiles[dockerfile],
      sha
    );
    images.push({ name: dockerfile, newName: newName });
  });

  // Update the kustomize file
  if (!editKustomization(sha, overlay, images)) {
    console.error("Could not edit kustomize file");
    return false;
  }

  // Apply the kubernetes configuration
  return true;
};
