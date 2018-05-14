<?php


/**
 * Application entry point that will load the right application module depending on the current url
 */

require 'php/libs/TurboCommons-Php/TurboCommons-Php-0.6.0.phar';
require 'php/libs/TurboERP/TurboERP.phar';

use com\edertone\turboERP\src\main\php\model\EntryPoint;
use com\edertone\turboProject\src\main\php\model\App;

App::construct();

EntryPoint::processUrl(__DIR__);

?>