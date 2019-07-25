<?php

/**
 * Entry point that generates the http document based on the current URL
 */

// TODO - cache implementation
if(file_exists('cache/hash')){

    require 'cache/hash-TODO';
    die();
}

require 'phar://libs/turbosite-php/turbosite-php-3.0.0.phar/php/autoloader-project.php';
require 'libs/turbocommons-php/turbocommons-php-2.1.1.phar';
require 'libs/turbodepot-php/turbodepot-php-5.0.0.phar';
require 'libs/turbosite-php/turbosite-php-3.0.0.phar';

$ws = org\turbosite\src\main\php\managers\WebSiteManager::getInstance();

$ws->generateContent(__FILE__);

?>