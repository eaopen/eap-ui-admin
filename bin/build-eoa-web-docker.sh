#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${DIR}/..

#yarn build:prod

# docker
docker build \
  --build-arg NODE_ENV=production \
  --tag eoa-web \
  .

## dicker login
LOGIN_FILE_PATH="${DIR}/openea-docker-login.sh"
if [ -f "$LOGIN_FILE_PATH" ]; then
  sh $LOGIN_FILE_PATH
fi

docker tag eoa-web openea-docker.pkg.coding.net/reps/docker/eoa-web:latest

docker push openea-docker.pkg.coding.net/reps/docker/eoa-web:latest

