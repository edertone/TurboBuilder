<?php

/**
 * Site entry point that generates the site document based on the current url
 */

require 'autoloader.php';
require 'libs/turbocommons-php/TurboCommons-Php-0.6.0.phar';
require 'libs/turbosite/TurboSite-Php-0.0.0.phar';

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->construct();

?>