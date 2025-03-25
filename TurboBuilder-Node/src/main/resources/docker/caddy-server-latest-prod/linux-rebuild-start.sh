#!/bin/bash

# This script is used to rebuild the docker containers when the docker-compose.yml or any other
# project file is changed, and then start the containers:
#
# cd /opt/caddy-server-latest-prod/
# chmod +x linux-rebuild-start.sh ; ./linux-rebuild-start.sh
#
# (launch as root)


docker compose down

docker compose build --no-cache

docker compose up -d

exit 0