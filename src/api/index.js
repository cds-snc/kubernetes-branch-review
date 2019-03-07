import fetch from "node-fetch";
import yaml from "js-yaml";
require("dotenv-safe").config({ allowEmptyValues: true });

const baseUrl = "https://api.digitalocean.com/v2";
const baseUrlKubernetes = `${baseUrl}/kubernetes`;

const { K8_API_KEY: TOKEN } = process.env;

const defaultOptions = {
  name: "stage-cluster-01",
  region: "tor1",
  version: "1",
  tags: ["stage"],
  node_pools: [
    {
      size: "s-1vcpu-2gb",
      count: 1,
      name: "frontend-pool",
      tags: ["frontend"]
    }
  ]
};

export const createCluster = async (options = {}) => {
  const endpoint = `${baseUrlKubernetes}/clusters`;
  const clusterOptions = Object.assign({}, defaultOptions, {
    ...options
  });

  console.log("CLUSTER OPTIONS", clusterOptions);

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

    const result = await res.json();
    return result;
  } catch (e) {
    console.log("createCluster error", e.message);
    return { error: true };
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

export const getCluster = async id => {
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

export const deleteCluster = async id => {
  const endpoint = `${baseUrlKubernetes}/clusters/${id}`;
  const res = await fetch(endpoint, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  });

  const result = await res.json();
  return result;
};

export const getConfig = async id => {
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
    doc = JSON.stringify(yaml.safeLoad(ymlStr, "utf8"));
    return doc;
  } catch (e) {
    console.log(e.message);
  }
};

export const getDroplets = async () => {
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

export const getLoadBalancers = async () => {
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

export const deleteLoadBalancer = async id => {
  const endpoint = `${baseUrl}/load_balancers/${id}`;
  const res = await fetch(endpoint, {
    method: "delete",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`
    }
  });

  const result = await res.json();
  return result;
};
