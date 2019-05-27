import fetch from "node-fetch";
import yaml from "js-yaml";
import { setOptions } from "../lib/util/setOptions";
import { Cluster } from "../interfaces/Cluster";
import { Droplet } from "../interfaces/Droplet";
import { LoadBalancer } from "../interfaces/LoadBalancer";
import { Options } from "../interfaces/Options";

require("dotenv-safe").config({ allowEmptyValues: true });

const baseUrl = "https://api.digitalocean.com/v2";
const baseUrlKubernetes = `${baseUrl}/kubernetes`;
const { K8_API_KEY: TOKEN } = process.env;

const fetchEndpoint = async (
  type: string,
  endpoint: string,
  parseJson: Boolean = true
) => {
  const res = await fetch(endpoint, {
    method: type,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  });

  if (!parseJson) {
    return res;
  }

  const result = await res.json();
  return result;
};

export const createCluster = async (
  options: Options
): Promise<{ kubernetes_cluster: Cluster } | false> => {
  // get the latest available k8 version from the api
  const version = await getLatestK8version();
  const endpoint = `${baseUrlKubernetes}/clusters`;
  const clusterOptions = setOptions({ ...options, version });

  const res = await fetch(endpoint, {
    method: "post",
    body: JSON.stringify(clusterOptions),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  });

  const result = await res.json();

  if (result && !result.kubernetes_cluster) {
    throw new Error(result.message);
  }

  return result;
};

export const getLatestK8version = async () => {
  const result = await fetchEndpoint("get", `${baseUrlKubernetes}/options`);
  return result.options.versions[0].slug;
};

export const getAllClusters = async () => {
  const result = await fetchEndpoint("get", `${baseUrlKubernetes}/clusters`);
  return result;
};

export const getCluster = async (
  id: string
): Promise<{ kubernetes_cluster: Cluster } | void> => {
  try {
    const result = await fetchEndpoint(
      "get",
      `${baseUrlKubernetes}/clusters/${id}`
    );
    return result;
  } catch (e) {
    console.log("getCluster", e.message);
  }
};

export const deleteCluster = async (id: string): Promise<void> => {
  await fetchEndpoint("delete", `${baseUrlKubernetes}/clusters/${id}`, false);
};

export const getConfig = async (id: string): Promise<string> => {
  let doc = "";

  try {
    const res = await fetchEndpoint(
      "get",
      `${baseUrlKubernetes}/clusters/${id}/kubeconfig`,
      false
    );

    // response is in yaml format
    const ymlStr = await res.text();
    // convert to json
    doc = JSON.stringify(yaml.safeLoad(ymlStr));
    return doc;
  } catch (e) {
    console.log("getConfig", e.message);
  }
};

export const getDroplets = async (): Promise<{
  droplets: Droplet[];
} | void> => {
  try {
    const result = await fetchEndpoint("get", `${baseUrl}/droplets`);
    return result;
  } catch (e) {
    console.log("getDroplets", e.message);
  }
};

export const deleteDropletByTag = async (tag: string): Promise<void> => {
  await fetchEndpoint(
    "delete",
    `${baseUrlKubernetes}/droplets?tag_name=${tag}`
  );
};

export const getLoadBalancers = async (): Promise<{
  load_balancers: LoadBalancer[];
} | void> => {
  try {
    const result = await fetchEndpoint("get", `${baseUrl}/load_balancers`);
    return result;
  } catch (e) {
    console.log("getLoadBalancers", e.message);
  }
};

export const deleteLoadBalancer = async (id: string): Promise<void> => {
  await fetchEndpoint("delete", `${baseUrl}/load_balancers/${id}`, false);
};
