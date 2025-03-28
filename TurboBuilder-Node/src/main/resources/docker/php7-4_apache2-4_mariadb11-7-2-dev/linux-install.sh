#!/bin/bash

# Run this script as root by moving into the parent directory and executing:
#
# chmod +x linux-install.sh ; ./linux-install.sh
#
# This script is intended to use on a fresh ubuntu server with Docker installed.
# It creates a system user with SFTP access and permissions to execute the php files in the Docker mounted volumes.
# Requests the user to set a password for the new user and the MariaDB root password and database name.
# It also sets up the home directory for the user and starts the Docker containers.


# Define the system user to be created
USERNAME="docker-user"

# Obtain the name for the directory containing this script
SCRIPT_DIR="$(basename "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)")"

# Define the home directory for the user to /opt/container-project-name
HOME_DIR="/opt/$SCRIPT_DIR"


# Check if script is run as root
if [ "$EUID" -ne 0 ]; then

    echo "Please run this script as root"
    exit 1
fi


# 1. Create the system user if it doesn't exist
if id -u "$USERNAME" >/dev/null 2>&1; then

  echo "User '$USERNAME' already exists. Skipping user creation."
  
else
  
  sudo adduser --system --no-create-home --shell=/usr/sbin/nologin "$USERNAME"
  
  if [ $? -ne 0 ]; then
    echo "Error creating user '$USERNAME'. Please check the logs and try again."
    exit 1
  fi
  
  echo "User '$USERNAME' created successfully."
fi


# 2. Verify www-data user exists (common for Apache)
# User that PHP-Apache runs as in the Docker container. We need to set the same group for the home directory, otherwise PHP 
# won't be able to write to the mounted volumes.
WWW_DATA_USER="www-data" 

if ! id -u "$WWW_DATA_USER" >/dev/null 2>&1; then

  echo "ERROR: User '$WWW_DATA_USER' (needed Apache user) does not exist. This will cause permission issues on your Docker PHP application."
  echo "If your Docker image uses a different user for Apache, adjust WWW_DATA_USER variable accordingly."
  exit 1
fi


# 3. Create the home directory if it doesn't exist, set ownership and permissions
if [ ! -d "$HOME_DIR" ]; then

  sudo mkdir -p "$HOME_DIR"
  
  if [ $? -ne 0 ]; then
  
    echo "Error creating home directory '$HOME_DIR'. Please check permissions and try again."
    sudo deluser --remove-home "$USERNAME"  # Cleanup user if home dir creation failed
    exit 1
  fi
fi

sudo chown "$USERNAME":"$WWW_DATA_USER" "$HOME_DIR"

if [ $? -ne 0 ]; then

  echo "Error setting ownership of '$HOME_DIR'. Please check permissions and try again."
  sudo deluser --remove-home "$USERNAME"  # Cleanup user if ownership setting failed
  exit 1
fi

sudo chmod 775 "$HOME_DIR"

if [ $? -ne 0 ]; then

  echo "Error setting permissions of '$HOME_DIR'. Please check permissions and try again."
  sudo deluser --remove-home "$USERNAME"  # Cleanup user if permission setting failed
  exit 1
fi

echo "Home directory '$HOME_DIR' created, ownership and permissions set successfully."


# 4. Set password for the new user
echo ""
echo "--- Setting password for user '$USERNAME' ---"
echo ""
sudo passwd "$USERNAME"
  
if [ $? -ne 0 ]; then

  echo "Error setting password for user '$USERNAME'. Please check the logs and try again."
  exit 1
fi
echo ""


# 5. Append SFTP configuration to the SSH configuration file
echo "
Match User $USERNAME
    ForceCommand internal-sftp
    ChrootDirectory /opt
    PasswordAuthentication yes
    PermitTTY no
    X11Forwarding no
    AllowTcpForwarding no
    AllowAgentForwarding no" >> /etc/ssh/sshd_config

# Restart SSH service
systemctl restart ssh


# 6. Create all the mount directories and make them writable by the user and www-data group
# Otherwise they will be owned by root and the docker apache user won't be able to write to them
// TODO - Arrancar el docker amb el mateix usuari docker-user i veure si podem evitar fer aixo
MOUNT_DIRS=(
  "$HOME_DIR/data"
  "$HOME_DIR/data/storage"
  "$HOME_DIR/data/storage/logs"
  "$HOME_DIR/data/htdocs"
  "$HOME_DIR/data/dbdata"
)

for dir in "${MOUNT_DIRS[@]}"; do
  sudo mkdir -p "$dir"
  sudo chown -R "$USERNAME":"$WWW_DATA_USER" "$dir"
  sudo chmod 775 "$dir"
done


# 7. Database configuration and Docker container startup
echo ""
echo "--- Database Configuration ---"
echo ""

read -p "Enter MariaDB root password (press enter for empty):" MARIADB_ROOT_PASSWORD
MARIADB_ROOT_PASSWORD=${MARIADB_ROOT_PASSWORD:-} 

read -p "Enter database name (press enter for [mariadb-dev]): " MARIADB_DATABASE
MARIADB_DATABASE=${MARIADB_DATABASE:-mariadb-dev}

# Export variables so they are available to docker-compose
export MARIADB_ROOT_PASSWORD="$MARIADB_ROOT_PASSWORD"
export MARIADB_DATABASE="$MARIADB_DATABASE"

echo "Starting Docker containers..."

# Start the Docker containers with custom values
docker compose up -d --quiet-pull

echo -e "\e[32mcorrectly installed\e[0m"

exit 0