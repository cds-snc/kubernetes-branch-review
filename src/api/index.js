import fetch from "node-fetch";

const baseUrl = "https://api.digitalocean.com/v2/kubernetes";
const { K8_API_KEY: TOKEN } = process.env;

const body = {
  name: "stage-cluster-01",
  region: "nyc1",
  version: "1.12.1-do.2",
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

export const createCluster = async () => {
  const endpoint = `${baseUrl}/clusters`;
  try {
    const res = await fetch(endpoint, {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    });

    const result = await res.json();
    return result;
  } catch (e) {
    console.log(e.message);
    return { error: true };
  }
};

export const getAllClusters = async () => {
  const endpoint = `${baseUrl}/clusters`;
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
  const endpoint = `${baseUrl}/clusters/${id}`;

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
  const endpoint = `${baseUrl}/clusters/${id}`;
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
  const endpoint = `${baseUrl}/clusters/${id}/kubeconfig`;

  console.log(endpoint);

  try {
    const res = await fetch(endpoint, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      }
    });

    // response is in yaml format
    return await res.text();
  } catch (e) {
    console.log(e.message);
  }

  return "hey";
};
