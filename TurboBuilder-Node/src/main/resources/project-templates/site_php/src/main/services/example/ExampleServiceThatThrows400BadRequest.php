<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that throws a 400 bad request error
 */
class ExampleServiceThatThrows400BadRequest extends WebService{


    protected function setup(){

    }


    public function run(){

        return $this->generateError(400, 'This is a bad request example', 'And this is the error message');
    }
}

?>