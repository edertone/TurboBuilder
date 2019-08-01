<?php

namespace project\src\main\services\example;

use UnexpectedValueException;
use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that throws a 500 error due to exception not being catched
 */
class ExampleServiceThatThrows500UnhandledException extends WebService{


    protected function setup(){

    }


    public function run(){

        throw new UnexpectedValueException('This exception inside the run method is not being correctly handled (catched)');
    }
}

?>