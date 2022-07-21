:: This file contains a template to automate the process of generating a new site_php project with the default project template, 
:: build it including the latest versions of its required turbo dependencies and launch the default site_php tests that are bundled with the template.
:: Modify it to fit your needs


@SET DESKTOP_PATH=D:\Storage\Desktop
@SET TURBOSITE_PHP_PATH=D:\Storage\Backups\Git\TurboSite\TurboSite-Php
@SET TURBOCOMMONS_PHP_PATH=D:\Storage\Backups\Git\TurboCommons\TurboCommons-Php
@SET TURBODEPOT_PHP_PATH=D:\Storage\Backups\Git\TurboDepot\TurboDepot-Php
@SET WEB_SERVER_DEV_FOLDER_PATH=C:\turbosite-webserver-symlink\_dev


:: Create a work directory into the OS desktop where the project will be generated and compiled

if exist "%DESKTOP_PATH%\site_php-dev" RD /S /Q "%DESKTOP_PATH%\site_php-dev"

mkdir "%DESKTOP_PATH%\site_php-dev"

cd "%DESKTOP_PATH%\site_php-dev"


:: Generate the site_php project and build all the turbo depedencies

call tb -g site_php

call npm ci

echo BUILD TURBOSITE ------------------------------------------------------------

cd "%TURBOSITE_PHP_PATH%"

call tb -cb 

echo BUILD TURBOCOMMONS ---------------------------------------------------------

cd "%TURBOCOMMONS_PHP_PATH%"

call tb -cb 

echo BUILD TURBODEPOT -----------------------------------------------------------

cd "%TURBODEPOT_PHP_PATH%"

call tb -cb


:: Copy all the turbo dependencies to the generated project libs folder

echo COPY DEPENDENCIES -----------------------------------------------------------

cd "%DESKTOP_PATH%\site_php-dev"

copy "%TURBOCOMMONS_PHP_PATH%\target\turbocommons-php\dist\*.*" "src\main\libs\turbocommons-php"
copy "%TURBOSITE_PHP_PATH%\target\turbosite-php\dist\*.*" "src\main\libs\turbosite-php"
copy "%TURBODEPOT_PHP_PATH%\target\turbodepot-php\dist\*.*" "src\main\libs\turbodepot-php"

if not exist "%WEB_SERVER_DEV_FOLDER_PATH%" mkdir "%WEB_SERVER_DEV_FOLDER_PATH%"


:: Build the project and run the tests

echo BUILD AND RUN TESTS -----------------------------------------------------------

call tb -cbst

pause