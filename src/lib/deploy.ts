import { applyConfig } from "./kubectl";
import { buildAndPush } from "./docker";
import { editKustomization } from "./kustomize";
import { elenchosConfig } from "./elenchosConfig";
import { checkout } from "./git";
import { Release } from "../interfaces/Release";

async function asyncForEach(
  array: Array<String>,
  callback: (a: String) => void
): Promise<void> {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index]);
  }
}

export const deploy = async (release: Release): Promise<Boolean> => {
  const { fullName, refId, sha, config } = release;

  if (!refId) {
    console.warn(`refIfd is not set`);
    return false;
  }

  // Checkout the code
  if (!(await checkout(fullName, sha))) {
    console.warn(`Could not checkout repo ${refId}`);
    return false;
  }

  // Parse the repo specific config file
  const { dockerfiles, overlay } = await elenchosConfig(sha);

  if (!dockerfiles || !overlay) {
    console.warn(`Could not get repo config ${refId}`);
    return false;
  }

  // Build all the modified docker images
  let images: Array<{}> = [];

  asyncForEach(Object.keys(dockerfiles), async (dockerfile: string) => {
    const newName = await buildAndPush(
      dockerfile,
      dockerfiles[dockerfile.toString()],
      sha
    );
    if (!newName) {
      console.warn(`Could not build ${dockerfile}`);
    } else {
      images.push({ name: dockerfile, newName: newName });
    }
  });

  // Update the kustomize file
  if (!(await editKustomization(sha, overlay, images))) {
    console.warn("Could not edit kustomize file");
    return false;
  }

  // Apply the kubernetes configuration
  if (!(await applyConfig(sha, overlay, config))) {
    console.warn("Could not apply kubectl config");
    return false;
  }
  return true;
};
