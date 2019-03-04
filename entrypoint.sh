#!/bin/sh
set -e

sh -c "dockerd --host=unix:///var/run/docker.sock --host=tcp://0.0.0.0:2375 &"
sh -c 'docker login -u _json_key -p "$(cat docker.json)" https://index.docker.io/v1/'
sh -c "yarn start"
