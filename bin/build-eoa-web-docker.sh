#!/bin/bash

cd ../

# docker
docker build \
  --build-arg NODE_ENV=production \
  --tag eoa-web \
  .

## dicker login
sh ./openea-docker-login.sh

docker tag eoa-web openea-docker.pkg.coding.net/reps/docker/eoa-web:latest

docker push openea-docker.pkg.coding.net/reps/docker/eoa-web:latest

