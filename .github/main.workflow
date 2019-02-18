workflow "CI/CD" {
  on = "push"
  resolves = [
    "Push",
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
  uses = "actions/gcloud/cli@1a017b23ef5762d20aeb3972079a7bce2c4a8bfe"
  needs = ["GCloud Auth"]
  runs = "gcloud kms decrypt --project=elenchos --plaintext-file=.env --ciphertext-file=.env.enc --location=global --keyring=deploy --key=env"
}

action "Test" {
  uses = "docker://culturehq/actions-yarn:latest"
  needs = ["Decrypt ENV", "Install"]
  args = "test"
}

action "Master filter" {
  uses = "actions/bin/filter@46ffca7632504e61db2d4cb16be1e80f333cb859"
  needs = ["Test"]
  args = "branch master"
}

action "Build image" {
  uses = "actions/docker/cli@8cdf801b322af5f369e00d85e9cf3a7122f49108"
  needs = ["Master filter"]
  args = "[\"build\", \"-t\", \"cdssnc/elenchos\", \".\"]"
}

action "Docker Registry" {
  uses = "actions/docker/login@8cdf801b322af5f369e00d85e9cf3a7122f49108"
  needs = ["Master filter"]
  secrets = ["DOCKER_USERNAME", "DOCKER_PASSWORD"]
}

action "Push" {
  uses = "actions/docker/cli@8cdf801b322af5f369e00d85e9cf3a7122f49108"
  needs = ["Build image", "Docker Registry"]
  args = "[\"push\", \"cdssnc/elenchos\"]"
}
