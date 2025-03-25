:: REM This script is used to list all the modules installed in this caddy server

@echo off
set CONTAINER_NAME=caddy

:: Get the running container name
for /f "tokens=*" %%i in ('docker ps --filter "name=%CONTAINER_NAME%" --format "{{.Names}}"') do set CONTAINER_NAME=%%i

:: Run the command
docker exec %CONTAINER_NAME% caddy list-modules


pause