<?php


/**
 * Site entry point that will load the right module depending on the current url
 */

require './autoloader.php';
require 'libs/turbocommons-php/TurboCommons-Php-0.6.0.phar';
require 'libs/turbosite/TurboSite-Php-0.0.0.phar';

use org\turbosite\src\main\php\model\WebSite;


$ws = new WebSite();

$ws->locales = ['ca_ES', 'es_ES'];

$ws->construct();

?>