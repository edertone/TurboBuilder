<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\managers\WebServiceManager;


/**
 * An example of a service that throws a 400 bad request error
 */
class ExampleServiceThatThrows400BadRequestService extends WebServiceManager{


    protected function setup(){

        $this->authorizeMethod = function () { return true; };
    }


    public function run(){

        return $this->generateError(400, 'This is a bad request example', 'And this is the error message');
    }
}

?>