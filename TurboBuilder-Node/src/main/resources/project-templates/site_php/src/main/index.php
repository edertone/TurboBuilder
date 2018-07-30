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
require 'libs/turbocommons-php/TurboCommons-Php-0.7.2.phar';
require 'libs/turbosite/TurboSite-Php-0.1.0.phar';

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->initialize(__FILE__);

?>