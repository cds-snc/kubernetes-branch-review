workflow "CI" {
  on = "push"
  resolves = [
    "Test",
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
