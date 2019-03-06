workflow "CI" {
  on = "push"
  resolves = [
    "Verify deployment",
  ]
}

action "GCloud Auth" {
  uses = "actions/gcloud/auth@1a017b23ef5762d20aeb3972079a7bce2c4a8bfe"
  secrets = ["GCLOUD_AUTH"]
}

action "Install" {
  uses = "docker://culturehq/actions-yarn:latest"
  args = "install"
}

action "Decrypt ENV" {
  uses = "actions/gcloud/cli@master"
  needs = ["GCloud Auth"]
  runs = "gcloud kms decrypt --project=elenchos --plaintext-file=.env --ciphertext-file=.env.enc --location=global --keyring=deploy --key=env"
}

action "Decrypt PEM" {
  uses = "actions/gcloud/cli@master"
  needs = ["GCloud Auth"]
  runs = "gcloud kms decrypt --project=elenchos --plaintext-file=github.pem --ciphertext-file=github.pem.enc --location=global --keyring=deploy --key=github"
}

action "Test" {
  uses = "docker://globegitter/alpine-yarn:0.27.5-node-8.1.3-ssh"
  needs = ["Decrypt ENV", "Install", "Decrypt PEM"]
  env = {
    CODE_DIR = "/github/home"
  }
  runs = "yarn test"
}

action "Master filter" {
  uses = "actions/bin/filter@46ffca7632504e61db2d4cb16be1e80f333cb859"
  needs = ["Test"]
  args = "branch master"
}

action "Decrypt gcloud" {
  uses = "actions/gcloud/cli@master"
  needs = ["Master filter"]
  runs = "gcloud kms decrypt --project=elenchos --plaintext-file=gcloud.json --ciphertext-file=gcloud.json.enc --location=global --keyring=deploy --key=gcloud"
}

action "Build image" {
  uses = "actions/docker/cli@8cdf801b322af5f369e00d85e9cf3a7122f49108"
  needs = ["Decrypt gcloud"]
  args = "build -t cdssnc/elenchos ."
}

action "Tag image for GCR" {
  needs = ["Build image"]
  uses = "actions/docker/tag@master"
  args = ["cdssnc/elenchos", "gcr.io/elenchos/app"]
}

action "Set Credential Helper for Docker" {
  needs = ["Tag image for GCR"]
  uses = "actions/gcloud/cli@master"
  args = ["auth", "configure-docker", "--quiet"]
}

action "Push" {
  needs = ["Set Credential Helper for Docker"]
  uses = "actions/gcloud/cli@master"
  runs = "sh -c"
  args = ["docker push gcr.io/elenchos/app"]
}

action "Load GKE kube credentials" {
  needs = ["Push"]
  uses = "actions/gcloud/cli@master"
  args = "container clusters get-credentials elenchos --zone us-central1-a --project elenchos"
}

action "Deploy" {
  needs = ["Load GKE kube credentials"]
  uses = "docker://gcr.io/cloud-builders/kubectl"
  runs = "sh -l -c"
  args = ["kubectl delete pod $(kubectl get pods | awk '/elenchos/ {print $1;exit}')"]
}

action "Verify deployment" {
  needs = ["Deploy"]
  uses = "docker://gcr.io/cloud-builders/kubectl"
  env = {
    DEPLOYMENT_NAME = "elenchos"
  }
  args = "rollout status deployment/elenchos"
}
