<?php

/**
 * Site entry point that generates the site document based on the current url
 */

// TODO - cache implementation
if(file_exists('cache/hash')){

    require 'cache/hash-TODO';
    die();
}

require 'autoloader.php';
require 'libs/turbocommons-php/TurboCommons-Php-0.7.3.phar';
require 'libs/turbosite/TurboSite-Php-0.2.0.phar';

$ws = org\turbosite\src\main\php\managers\WebSiteManager::getInstance();

$ws->initialize(__FILE__);

?>