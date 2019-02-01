<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service without any parameter
 */
class ExampleServiceWithoutParams extends WebService{


    protected function setup(){

        // Nothing is changed here
        // No GET nor POST parameters are accepted
    }


    public function run(){

        return 'Any value can be output by the service as a string (json or xml data, plain text, etc..)';
    }

}

?>