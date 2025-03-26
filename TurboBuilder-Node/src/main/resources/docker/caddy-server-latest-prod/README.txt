This is a docker project containing the following elements:

    Caddy server (latest version)
        - A web server with automatic ssl certificates that can also be used as a reverse proxy on production projects.
        
        cache-handler plugin (https://github.com/caddyserver/cache-handler)
            - A plugin that helps with caching the responses of proxied sites. It is configured using the badger storage engine
            - Cache data is stored in the mounted volume ./caddy/caddy_cache
                
                
You only need to modify the Caddyfile to configure the caddy server, and add static sites content to the static-sites-content folder if needed.


The container folders are mapped to the following relevant folders:

    ./Caddyfile which contains the caddy server configuration file.
    ./static-sites-content which contains the static sites content to be served by the caddy server.
    ./logs which contains the different caddy server logs.
    .caddy which will be filled with the caddy server data, setups, and cache.

Notes:
    
    - The docker containers are setup to automatically restart on server reboot.

    - To apply caddyfile modifications, launch linux-hot-reload.sh script at the folder root or execute the following command at the root of the docker project:
    
        docker compose restart caddy
        
How to use the cache:

    - Review the Caddyfile to see the global cache settings and see if they fit your needs.
    - Put the cache directive in the Caddyfile for the sites you want to cache.
    - Reload the Caddyfile using the linux-hot-reload.sh script or the command mentioned above.