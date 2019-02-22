workflow "CI" {
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
  uses = "actions/gcloud/cli@master"
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

action "Decrypt PEM" {
  uses = "actions/gcloud/cli@master"
  needs = ["Master filter"]
  runs = "gcloud kms decrypt --project=elenchos --plaintext-file=github.pem --ciphertext-file=github.pem.enc --location=global --keyring=deploy --key=github"
}


action "Build image" {
  uses = "actions/docker/cli@8cdf801b322af5f369e00d85e9cf3a7122f49108"
  needs = ["Decrypt PEM"]
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
