:: This file contains a template to automate the process of generating a new site_php project with the default project template, 
:: build it including the latest versions of its required turbo dependencies and launch the default site_php tests that are bundled with the template.
:: Modify it to fit your needs


@SET DESKTOP_PATH=%USERPROFILE%\Desktop
@SET TURBOSITE_PHP_PATH=%USERPROFILE%\git\TurboSite\TurboSite-Php
@SET TURBOCOMMONS_PHP_PATH=%USERPROFILE%\git\TurboCommons\TurboCommons-Php
@SET TURBODEPOT_PHP_PATH=%USERPROFILE%\git\TurboDepot\TurboDepot-Php
@SET WEB_SERVER_DEV_FOLDER_PATH=C:\turbosite-webserver-symlink\_dev


:: Create a work directory into the OS desktop where the project will be generated and compiled

RD /S /Q "%DESKTOP_PATH%\site_php-dev"

mkdir "%DESKTOP_PATH%\site_php-dev"

cd "%DESKTOP_PATH%\site_php-dev"


:: Generate the site_php project and build all the turbo depedencies

call tb -g site_php

call npm ci

set PROJECT_DIR=%cd%

cd "%TURBOSITE_PHP_PATH%"

call tb -cb 

cd "%TURBOCOMMONS_PHP_PATH%"

call tb -cb 

cd "%TURBODEPOT_PHP_PATH%"

call tb -cb 

cd %PROJECT_DIR%


:: Copy all the turbo dependencies to the generated project libs folder

copy "%TURBOCOMMONS_PHP_PATH%\target\turbocommons-php\dist\*.*" "src\main\libs\turbocommons-php"
copy "%TURBOSITE_PHP_PATH%\target\turbosite-php\dist\*.*" "src\main\libs\turbosite-php"
copy "%TURBODEPOT_PHP_PATH%\target\turbodepot-php\dist\*.*" "src\main\libs\turbodepot-php"

md "%WEB_SERVER_DEV_FOLDER_PATH%"


:: Build the project and run the tests

call tb -cbst

pause