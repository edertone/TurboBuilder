REM This file contains a template to automate the process of building a generated site_php
REM project, including required turbo dependencies and launching the respective tests.
REM Modify it to fit your needs: replace --Desktop-- and --git-root-- by the real locations
 

RD /S /Q "--Desktop--\site_php-dev"

mkdir "--Desktop--\site_php-dev"

cd "--Desktop--\site_php-dev"

call tb -g site_php

call npm ci

set currentdir=%cd%

cd "--git-root--\TurboSite\TurboSite-Php"

call tb -cb 

cd "--git-root--\TurboCommons\TurboCommons-Php"

call tb -cb 

cd "--git-root--\TurboDepot\TurboDepot-Php"

call tb -cb 

cd %currentdir%

copy "--git-root--\TurboCommons\TurboCommons-Php\target\turbocommons-php\dist\*.*" "src\main\libs\turbocommons-php"
copy "--git-root--\TurboSite\TurboSite-Php\target\turbosite-php\dist\*.*" "src\main\libs\turbosite-php"
copy "--git-root--\TurboDepot\TurboDepot-Php\target\turbodepot-php\dist\*.*" "src\main\libs\turbodepot-php"

md "C:/turbosite-webserver-symlink/_dev"

call tb -cbst

pause