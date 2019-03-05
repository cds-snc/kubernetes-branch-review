#!/bin/sh
set -e

sh -c "dockerd --host=unix:///var/run/docker.sock --host=tcp://0.0.0.0:2375 &"
sh -c 'docker login -u elenchosclient -p "$(cat docker.txt)"'
sh -c "yarn start"
