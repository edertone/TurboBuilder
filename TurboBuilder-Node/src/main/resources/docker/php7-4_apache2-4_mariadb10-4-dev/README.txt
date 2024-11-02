This is a docker project containing the following elements:

PHP 7.4.33
APACHE 2.4
MARIADB 10.4

To build all containers in this docker project, use this CMD command at the root of the docker project: 

    docker compose build
    
To launch the container for this project, use:

    docker compose up -d
    
To Unload the container for this project, use:

    docker compose down -v

To see installed PHP modules, use:

    docker compose exec web-app php -m
    
To directly interact with the internal docker image cmd, use:

    TODO