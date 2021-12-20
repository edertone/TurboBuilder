<?php

/**
 * Entry point that generates the http document based on the current URL
 */

if(file_exists($cacheFile = __DIR__.DIRECTORY_SEPARATOR.'___views_cache___'.DIRECTORY_SEPARATOR.hash('md5', $_SERVER['REQUEST_URI']))){

    require $cacheFile;
    die();
}

require 'phar://libs/turbosite-php/turbosite-php-8.2.0.phar/php/autoloader-project.php';
require 'libs/turbocommons-php/turbocommons-php-3.8.0.phar';
require 'libs/turbodepot-php/turbodepot-php-7.0.1.phar';
require 'libs/turbosite-php/turbosite-php-8.2.0.phar';

$ws = org\turbosite\src\main\php\managers\WebSiteManager::getInstance();

$ws->generateContent(__FILE__);

?>