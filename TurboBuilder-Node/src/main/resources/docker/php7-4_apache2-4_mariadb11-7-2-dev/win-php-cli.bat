:: This script allows executing PHP CLI commands via windows inside the Docker container when its running.
:: The %* parameter forwards all command-line arguments to the PHP interpreter within the container.
:: It can be used to run PHP scripts, execute Composer commands, etc. just like you would on the host machine.

@echo off
setlocal

set CONTAINER_NAME=web-app
set PHP_COMMAND=php %*

docker exec %CONTAINER_NAME% %PHP_COMMAND%

endlocal