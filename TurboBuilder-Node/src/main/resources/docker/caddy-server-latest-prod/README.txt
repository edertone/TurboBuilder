This is a docker project containing the following elements:

    Caddy server (latest version)
        - A web server with automatic ssl certificates that can also be used as a reverse proxy on production projects.


The container folders are mapped to the following relevant folders:

    ./Caddyfile which contains the caddy server configuration file.
    ./static-sites-content which contains the static sites content to be served by the caddy server.
    ./logs which contains the caddy server logs.

Notes:
    
    - The docker containers are setup to automatically restart on server reboot.

    - To apply caddyfile modifications, execute the following command at the root of the docker project:
    
        docker compose restart caddy