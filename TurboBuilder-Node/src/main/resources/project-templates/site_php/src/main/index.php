<?php

/**
 * TurboCommons is a general purpose and cross-language library that implements frequently used and generic software development tasks.
 *
 * Website : -> http://www.turbocommons.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


/**
 * Application entry point that will load the right application module depending on the current url
 */

require 'php/libs/TurboCommons-Php/TurboCommons-Php-0.6.0.phar';
require 'php/libs/TurboSite/TurboSite-0.0.1.phar';

use com\edertone\turboERP\src\main\php\model\EntryPoint;
use com\edertone\turboProject\src\main\php\model\App;

App::construct();

EntryPoint::processUrl(__DIR__);

?>