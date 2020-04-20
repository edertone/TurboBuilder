<?php

/**
 * Entry point that generates the http document based on the current URL
 */

// TODO - cache implementation
if(file_exists('cache/hash')){

    require 'cache/hash-TODO';
    die();
}

require 'phar://libs/turbosite-php/turbosite-php-7.0.0.phar/php/autoloader-project.php';
require 'libs/turbocommons-php/turbocommons-php-3.1.0.phar';
require 'libs/turbodepot-php/turbodepot-php-6.3.1.phar';
require 'libs/turbosite-php/turbosite-php-7.0.0.phar';

$ws = org\turbosite\src\main\php\managers\WebSiteManager::getInstance();

$ws->generateContent(__FILE__);

?>