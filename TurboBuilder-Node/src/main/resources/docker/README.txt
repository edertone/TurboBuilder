NOTICE: Make sure you are using docker in the linux container mode.


This folder contains several ready to user docker-compose images with different software versions and configurations.



To build all containers in a docker project, use this CMD command at the root of the docker project: 

    docker compose build
    
To launch the container for a project, use:

    docker compose up -d
    
To Unload the container for a project, use:

    docker compose down -v

To see installed PHP modules, use:

    docker compose exec web-app php -m
    
To directly interact with the internal docker image cmd, use:

    TODO