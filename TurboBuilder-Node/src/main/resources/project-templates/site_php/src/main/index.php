<?php


/**
 * Site entry point that will load the right module depending on the current url
 */

require './autoloader.php';
require 'libs/turbocommons-php/TurboCommons-Php-0.6.0.phar';
// require 'libs/turbosite/TurboSite-0.0.1.phar';

use site\src\main\model\php\WebSite;


$ws = new WebSite();

$ws->locales = ['ca_ES', 'es_ES'];

$ws->construct();

?>