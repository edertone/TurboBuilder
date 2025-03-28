# Information about the docker containers on this folder

This folder contains several ready to user docker-compose images with different software versions and configurations. They can be used to develop locally and also on development or production servers

**NOTICE**: Make sure you are using docker in the linux container mode.


## How to use the containers on development or production servers

- As root, copy the container project to the server /opt folder (opt is a folder suitable for 3rd party applications):

    For example /opt/php7-4_apache2-4_mariadb11-7-2-dev
    
- Execute the install script (Containers are set to automatically restart if server reboots):

    Move the cmd to your /opt/container folder and run:
    chmod +x linux-install.sh ; ./linux-install.sh
    Follow the script instructions if necessary

- As the docker-user, upload the necessary files to the server docker mounted volumes:

    Check which volumes are mounted by the docker projects and place any required files so the project can be executed

- To completely stop and remove everything related to your Docker Compose project (containers, networks, volumes, and images), use:

    Move the cmd to your /opt/container folder and run:
    chmod +x linux-uninstall.sh ; ./linux-uninstall.sh

## CMD useful commands

- To build all containers, use this at the root of the docker project: 

    docker compose build
    
- To launch the container for a project, use:

    docker compose up -d
    
- To see all running containers on the system:

    docker ps
    
- To Unload the container for a project, use:

    docker compose down -v
    
- To see logs related to the container startup or possible failure starting:

    docker logs <container-name-see-with-docker-ps>

- To see installed PHP modules, use:

    docker compose exec web-app php -m
    
- To directly interact with the internal docker image cmd, use:

    TODO