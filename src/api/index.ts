import fetch from "node-fetch";
import yaml from "js-yaml";
import { setOptions } from "../lib/setOptions";
import { Cluster } from "../interfaces/Cluster";
import { Droplet } from "../interfaces/Droplet";
import { LoadBalancer } from "../interfaces/LoadBalancer";
import { Options } from "../interfaces/Options";



require("dotenv-safe").config({ allowEmptyValues: true });

const baseUrl = "https://api.digitalocean.com/v2";
const baseUrlKubernetes = `${baseUrl}/kubernetes`;

const { K8_API_KEY: TOKEN } = process.env;

export const createCluster = async (options:Options): Promise<{kubernetes_cluster: Cluster}|false> => {
  const endpoint = `${baseUrlKubernetes}/clusters`;
  const clusterOptions = setOptions(options);

  try {
    console.log("fetch");
    const res = await fetch(endpoint, {
      method: "post",
      body: JSON.stringify(clusterOptions),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    }).catch(e => {
      console.log("message");
      console.log(e.message);
    });
    if (res){    
      const result = await res.json();
      return result;
    }
    else{
      return false
    }

  } catch (e) {
    console.log("createCluster error", e.message);
    return false;
  }
};

export const getAllClusters = async () => {
  const endpoint = `${baseUrlKubernetes}/clusters`;
  const res = await fetch(endpoint, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  });

  const result = await res.json();
  return result;
};

export const getCluster = async (id:string): Promise<{kubernetes_cluster: Cluster}|void> => {
  const endpoint = `${baseUrlKubernetes}/clusters/${id}`;

  try {
    const res = await fetch(endpoint, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    });

    const result = await res.json();
    return result;
  } catch (e) {
    console.log(e.message);
  }
};

export const deleteCluster = async (id:string): Promise<true> => {
  const endpoint = `${baseUrlKubernetes}/clusters/${id}`;
  await fetch(endpoint, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  });

  return true;
};

export const getConfig = async (id:string): Promise<string> => {
  const endpoint = `${baseUrlKubernetes}/clusters/${id}/kubeconfig`;
  let doc = "";

  try {
    const res = await fetch(endpoint, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    });

    // response is in yaml format
    const ymlStr = await res.text();
    // convert to json
    doc = JSON.stringify(yaml.safeLoad(ymlStr));
    return doc;
  } catch (e) {
    console.log(e.message);
  }
};

export const getDroplets = async (): Promise<{droplets: Droplet[]}|void> => {
  const endpoint = `${baseUrl}/droplets`;

  try {
    const res = await fetch(endpoint, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    });

    const result = await res.json();
    return result;
  } catch (e) {
    console.log(e.message);
  }
};

export const deleteDropletByTag = async (tag:string): Promise<true> => {
  const endpoint = `${baseUrlKubernetes}/droplets?tag_name=${tag}`;
  await fetch(endpoint, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  });
  return true;
};

export const getLoadBalancers = async (): Promise<{load_balancers: LoadBalancer[]}|void> => {
  const endpoint = `${baseUrl}/load_balancers`;

  try {
    const res = await fetch(endpoint, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    });

    const result = await res.json();
    return result;
  } catch (e) {
    console.log(e.message);
  }
};

export const deleteLoadBalancer = async (id:string): Promise<true> => {
  const endpoint = `${baseUrl}/load_balancers/${id}`;
  await fetch(endpoint, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  });

  return true;
};
