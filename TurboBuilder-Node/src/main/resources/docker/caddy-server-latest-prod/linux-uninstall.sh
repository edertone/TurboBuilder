#!/bin/bash

# Run this script as root by moving into the parent directory and executing:
#
# chmod +x linux-uninstall.sh ; ./linux-uninstall.sh
#
# This script is used to remove the running docker containers
# Data on the host docker volumes will not be removed.
# Docker containers will be removed, and images created by the docker-compose.yaml will be deleted.


# 1. Stop and remove the Docker containers and clear the stored docker images from disk
docker compose down --rmi all -v --remove-orphans