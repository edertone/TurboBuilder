<?php

/**
 * Site entry point that generates the site document based on the current url
 */

// TODO - cache implementation
if(file_exists('cache/hash')){

    require 'cache/hash-TODO';
    die();
}

// Check server version
if (version_compare(PHP_VERSION, '7.1.0', '<')) {

    die('PHP 7.1.0 required but found '.PHP_VERSION);
}

require 'autoloader.php';
require 'libs/turbocommons-php/TurboCommons-Php-0.7.2.phar';
require 'libs/turbosite/TurboSite-Php-0.2.0.phar';

$ws = org\turbosite\src\main\php\managers\WebSiteManager::getInstance();

$ws->initialize(__FILE__);

?>