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

const getDockerImages = async (sha: string, refId: string) => {
  // Parse the repo specific config file
  const configuration = await elenchosConfig(sha);

  if (!configuration || !configuration.dockerfiles || !configuration.overlay) {
    console.warn(`Could not get repo config ${refId}`);
    return false;
  }

  const { dockerfiles, overlay } = configuration;

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

  console.log("built & pushed images");
  console.log(images);

  return { overlay, images };
};

const updateConfig = async (sha: string, refId: string, config: string) => {
  const docker = await getDockerImages(sha, refId);
  if (!docker) return false;

  // Update the kustomize file
  console.log("try update config");
  const { images, overlay } = docker;
  const edit = await editKustomization(sha, overlay, images);
  const apply = await applyConfig(sha, overlay, config);

  if (!edit || !apply) {
    console.log("edit or apply failed");
    return false;
  }

  console.log("updated config");

  return true;
};

export const deploy = async (release: Release): Promise<Boolean> => {
  const { fullName, refId, sha, config } = release;

  // Checkout the code
  if (!(await checkout(fullName, sha))) {
    console.warn(`Could not checkout repo ${refId}`);
    return false;
  }

  const result = await updateConfig(sha, refId, config);
  return result;
};
