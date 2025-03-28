# This script is used to rebuild the docker containers when the docker-compose.yml or any other
# project file is changed, and then start the containers

docker compose down

docker compose build --no-cache

docker compose up -d