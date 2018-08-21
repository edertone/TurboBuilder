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
    
    // TODO - throw exception instead of echoing the error message, and make
    // sure that it is captured by the error management
    echo 'PHP 7.1.0 required but found '.PHP_VERSION;
    die();
}

require 'autoloader.php';
require 'libs/turbocommons-php/TurboCommons-Php-0.7.2.phar';
require 'libs/turbosite/TurboSite-Php-0.2.0.phar';

$ws = org\turbosite\src\main\php\model\WebSite::getInstance();

$ws->initialize(__FILE__);

?>