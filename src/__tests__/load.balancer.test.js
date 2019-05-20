import { getCluster, getDroplets, getLoadBalancers } from "../api";
import { getLoadBalancerIp } from "../lib/loadBalancer/getLoadBalancer";

const clusterData = {
  kubernetes_cluster: {
    id: "6852836d-d150-4187-be50-861c62b0ffe0",
    name: "mock-stage-cluster-01",
    region: "nyc1",
    version: "1.12.1-do.2",
    cluster_subnet: "10.244.0.0/16",
    service_subnet: "10.245.0.0/16",
    ipv4: "68.183.135.145",
    endpoint:
      "https://6852836d-d150-4187-be50-861c62b0ffe0.k8s.ondigitalocean.com",
    tags: ["stage", "k8s", "k8s:6852836d-d150-4187-be50-861c62b0ffe0"],
    node_pools: [
      {
        id: "b0316731-32ff-47f4-88c4-04d98bf1c514",
        name: "frontend-pool",
        size: "s-1vcpu-2gb",
        count: 1,
        tags: [
          "frontend",
          "k8s",
          "k8s:6852836d-d150-4187-be50-861c62b0ffe0",
          "k8s:worker"
        ],
        nodes: [
          {
            id: "d1cefeb9-4186-4784-a31b-aa3b45422b73",
            name: "romantic-jepsen-uk62",
            status: { state: "running" },
            created_at: "2019-02-28T14:11:59Z",
            updated_at: "2019-02-28T14:14:18Z"
          }
        ]
      }
    ],
    status: { state: "running" },
    created_at: "2019-02-28T14:11:59Z",
    updated_at: "2019-02-28T14:14:18Z"
  }
};

const dropletData = {
  droplets: [
    {
      id: 5187199,
      name: "example.com",
      memory: 512,
      vcpus: 1,
      disk: 20,
      locked: false,
      status: "active",
      kernel: {
        id: 1396,
        name: "Ubuntu 14.04 x64 vmlinuz-3.13.0-27-generic",
        version: "3.13.0-27-generic"
      },
      created_at: "2015-05-07T19:36:14Z",
      features: ["virtio"],
      backup_ids: [],
      next_backup_window: null,
      snapshot_ids: [],
      image: {
        id: 6423475,
        name: "WordPress on 14.04",
        distribution: "Ubuntu",
        slug: null,
        public: false,
        regions: ["ams2", "nyc1"],
        created_at: "2014-09-28T21:34:48Z",
        min_disk_size: 20,
        type: "snapshot",
        size_gigabytes: 4.12
      },
      volume_ids: [],
      size: {
        slug: "512mb",
        memory: 512,
        vcpus: 1,
        disk: 20,
        transfer: 1,
        price_monthly: 5,
        price_hourly: 0.00744,
        regions: [
          "ams2",
          "ams3",
          "blr1",
          "fra1",
          "lon1",
          "nyc1",
          "nyc2",
          "nyc3",
          "sfo1",
          "sfo2",
          "sgp1",
          "tor1"
        ],
        available: true
      },
      size_slug: "512mb",
      networks: {
        v4: [
          {
            ip_address: "104.131.119.47",
            netmask: "255.255.192.0",
            gateway: "104.131.64.1",
            type: "public"
          }
        ],
        v6: []
      },
      region: {
        name: "New York 3",
        slug: "nyc3",
        features: [
          "private_networking",
          "backups",
          "ipv6",
          "metadata",
          "install_agent",
          "storage",
          "image_transfer"
        ],
        available: true,
        sizes: ["512mb", "1gb", "2gb"]
      },
      tags: []
    },
    {
      id: 67008549,
      name: "max.org",
      memory: 1024,
      vcpus: 1,
      disk: 30,
      locked: false,
      status: "active",
      kernel: null,
      created_at: "2017-10-19T14:14:06Z",
      features: ["backups"],
      backup_ids: [43470386, 43738019, 44007681, 44276714],
      next_backup_window: {
        start: "2019-03-09T20:00:00Z",
        end: "2019-03-10T19:00:00Z"
      },
      snapshot_ids: [],
      image: {
        id: 27663881,
        name: "16.04.3 x64",
        distribution: "Ubuntu",
        slug: null,
        public: false,
        regions: [
          "nyc1",
          "sfo1",
          "nyc2",
          "ams2",
          "sgp1",
          "lon1",
          "nyc3",
          "ams3",
          "fra1",
          "tor1",
          "sfo2",
          "blr1"
        ],
        created_at: "2017-09-08T14:33:39Z",
        min_disk_size: 20,
        type: "snapshot",
        size_gigabytes: 0.35
      },
      volume_ids: [],
      size: {
        slug: "1gb",
        memory: 1024,
        vcpus: 1,
        disk: 30,
        transfer: 2,
        price_monthly: 10,
        price_hourly: 0.01488,
        regions: [
          "ams2",
          "ams3",
          "blr1",
          "fra1",
          "lon1",
          "nyc1",
          "nyc2",
          "nyc3",
          "sfo1",
          "sfo2",
          "sgp1",
          "tor1"
        ],
        available: true
      },
      size_slug: "1gb",
      networks: {
        v4: [
          {
            ip_address: "159.89.4.222",
            netmask: "255.255.240.0",
            gateway: "159.89.0.1",
            type: "public"
          }
        ],
        v6: []
      },
      region: {
        name: "Frankfurt 1",
        slug: "fra1",
        features: [
          "private_networking",
          "backups",
          "ipv6",
          "metadata",
          "install_agent",
          "storage",
          "image_transfer"
        ],
        available: true,
        sizes: ["512mb", "1gb", "2gb"]
      },
      tags: []
    },
    {
      id: 134648388,
      name: "romantic-jepsen-uk62",
      memory: 2048,
      vcpus: 1,
      disk: 50,
      locked: false,
      status: "active",
      kernel: null,
      created_at: "2019-02-28T14:13:10Z",
      features: ["private_networking"],
      backup_ids: [],
      next_backup_window: null,
      snapshot_ids: [],
      image: {
        id: 40705622,
        name: "do-kube-base",
        distribution: "Debian",
        slug: null,
        public: false,
        regions: [
          "nyc1",
          "sfo1",
          "nyc2",
          "ams2",
          "sgp1",
          "lon1",
          "nyc3",
          "ams3",
          "fra1",
          "tor1",
          "sfo2",
          "blr1"
        ],
        created_at: "2018-11-26T11:03:50Z",
        min_disk_size: 20,
        type: "snapshot",
        size_gigabytes: 2.83
      },
      volume_ids: [],
      size: {
        slug: "s-1vcpu-2gb",
        memory: 2048,
        vcpus: 1,
        disk: 50,
        transfer: 2,
        price_monthly: 10,
        price_hourly: 0.01488,
        regions: [
          "ams2",
          "ams3",
          "blr1",
          "fra1",
          "lon1",
          "nyc1",
          "nyc2",
          "nyc3",
          "sfo1",
          "sfo2",
          "sgp1",
          "tor1"
        ],
        available: true
      },
      size_slug: "s-1vcpu-2gb",
      networks: {
        v4: [
          {
            ip_address: "104.248.50.165",
            netmask: "255.255.240.0",
            gateway: "104.248.48.1",
            type: "public"
          },
          {
            ip_address: "10.136.127.104",
            netmask: "255.255.0.0",
            gateway: "10.136.0.1",
            type: "private"
          }
        ],
        v6: []
      },
      region: {
        name: "New York 1",
        slug: "nyc1",
        features: [
          "private_networking",
          "backups",
          "ipv6",
          "metadata",
          "install_agent",
          "storage",
          "image_transfer"
        ],
        available: true,
        sizes: ["512mb", "8gb", "1gb", "2gb"]
      },
      tags: [
        "frontend",
        "k8s",
        "k8s:6852836d-d150-4187-be50-861c62b0ffe0",
        "k8s:worker"
      ]
    }
  ],
  links: {},
  meta: {
    total: 3
  }
};

const loadBalancerData = {
  load_balancers: [
    {
      id: "2d181d60-a6b2-4ee5-b43a-49e83d28bf61",
      name: "af7b7c0883e9311e9b00622f908221e2",
      ip: "206.189.253.189",
      algorithm: "round_robin",
      status: "active",
      created_at: "2019-03-04T15:41:26Z",
      forwarding_rules: [
        {
          entry_protocol: "tcp",
          entry_port: 80,
          target_protocol: "tcp",
          target_port: 30827,
          certificate_id: "",
          tls_passthrough: false
        }
      ],
      health_check: {
        protocol: "tcp",
        port: 30827,
        path: "",
        check_interval_seconds: 3,
        response_timeout_seconds: 5,
        healthy_threshold: 5,
        unhealthy_threshold: 3
      },
      sticky_sessions: {
        type: "none"
      },
      region: {
        name: "New York 1",
        slug: "nyc1",
        features: [
          "private_networking",
          "backups",
          "ipv6",
          "metadata",
          "install_agent",
          "storage",
          "image_transfer"
        ],
        available: true,
        sizes: ["512mb", "8gb", "1gb", "2gb"]
      },
      tag: "",
      droplet_ids: [134648388],
      redirect_http_to_https: false
    }
  ],
  links: {},
  meta: {
    total: 1
  }
};

const mockGetCluster = jest.fn().mockReturnValue(clusterData);
const mockGetDroplets = jest.fn().mockReturnValue(dropletData);
const mockGetloadBalancerData = jest.fn().mockReturnValue(loadBalancerData);

jest.mock("../api", () => ({
  getLoadBalancers: jest.fn(() => {
    return mockGetloadBalancerData();
  }),

  getDroplets: jest.fn(() => {
    return mockGetDroplets();
  }),
  getCluster: jest.fn(() => {
    return mockGetCluster();
  })
}));

test("can get load balancer from ip", async () => {
  const ip = await getLoadBalancerIp("6852836d-d150-4187-be50-861c62b0ffe0");
  expect(getCluster).toHaveBeenCalledTimes(1);
  expect(getDroplets).toHaveBeenCalledTimes(1);
  expect(getLoadBalancers).toHaveBeenCalledTimes(1);
  expect(ip).toEqual("206.189.253.189");
});
