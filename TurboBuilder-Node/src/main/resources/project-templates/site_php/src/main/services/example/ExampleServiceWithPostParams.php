<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that must be called with POST parameters
 */
class ExampleServiceWithPostParams extends WebService{


    protected function setup(){

        $this->enabledPostParams[] = ['param1'];
        $this->enabledPostParams[] = ['param2'];
    }


    public function run(){

        return [
            "info" => "this object is returned as a json string with the received POST parameters",
            "received-param1" => $this->getPostParam('param1'),
            "received-param2" => $this->getPostParam('param2')
        ];
    }
}

?>