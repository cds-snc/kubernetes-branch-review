#!/bin/sh
set -e

sh -c "gcloud auth activate-service-account --key-file docker.json"
sh -c "npm start"
