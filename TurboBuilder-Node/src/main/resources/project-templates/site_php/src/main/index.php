<?php

/**
 * Entry point that generates the http document based on the current URL
 */

// TODO - cache implementation
if(file_exists('cache/hash')){

    require 'cache/hash-TODO';
    die();
}

require 'autoloader.php';
require 'libs/turbocommons-php/TurboCommons-Php-0.7.3.phar';
require 'libs/turbosite/turbosite-php-0.3.0.phar';

$ws = org\turbosite\src\main\php\managers\WebSiteManager::getInstance();

$ws->generateContent(__FILE__);

?>