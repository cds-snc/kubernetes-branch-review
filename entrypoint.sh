#!/bin/sh
set -e

sh -c "dockerd --host=unix:///var/run/docker.sock --host=tcp://0.0.0.0:2375 --insecure-registry=registry:5000 &"
sh -c "yarn start"
