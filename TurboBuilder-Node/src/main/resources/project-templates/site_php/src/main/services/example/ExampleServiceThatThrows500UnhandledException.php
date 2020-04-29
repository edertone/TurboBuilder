<?php

namespace project\src\main\services\example;

use UnexpectedValueException;
use org\turbosite\src\main\php\managers\WebServiceManager;


/**
 * An example of a service that throws a 500 error due to exception not being catched
 */
class ExampleServiceThatThrows500UnhandledException extends WebServiceManager{


    protected function setup(){

        $this->authorizeMethod = function () { return true; };
    }


    public function run(){

        throw new UnexpectedValueException('This exception inside the run method is not being correctly handled (catched)');
    }
}

?>