#!/bin/bash

# Run this script as root by moving into the parent directory and executing:
#
# chmod +x linux-uninstall.sh ; ./linux-uninstall.sh
#
# This script is used to remove the running docker containers
# Data on the host docker volumes will not be removed.
# Docker containers will be removed, and images created by the docker-compose.yaml will be deleted.
# docker-user and group will be removed


USERNAME="docker-user"


# Check if script is run as root
if [ "$EUID" -ne 0 ]; then

    echo "Please run this script as root"
    exit 1
fi


# Verify user exists
if ! id -u "$USERNAME" >/dev/null 2>&1; then

    echo "Error: User $USERNAME does not exist"
    exit 1
fi

# 1. Stop and remove the Docker containers and clear the stored docker images from disk
docker compose down --rmi all -v --remove-orphans


# 2. Remove the system user
sudo deluser --force --remove-home "$USERNAME"

if [ $? -ne 0 ]; then

  echo "Error removing user '$USERNAME'. Please check the logs and try again."
  exit 1
fi


# 3. Clean up SSH/SFTP configurations
sed -i "/Match User $USERNAME/,/^$/d" /etc/ssh/sshd_config
systemctl restart ssh

echo "User '$USERNAME' removed successfully."

echo -e "\e[32mcorrectly uninstalled\e[0m"

exit 0