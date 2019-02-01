<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that may be called with GET parameters
 */
class ExampleServiceWithGetParamsOptional extends WebService{


    protected function setup(){

        $this->enabledGetParams = 4;

        $this->isGetDataMandatory = false;
    }


    public function run(){

        return [
            "info" => "this object is returned as a json string with the optionally received GET parameters values",
            "received-param-0-value" => $this->getParam(0),
            "received-param-1-value" => $this->getParam(1),
            "received-param-2-value" => $this->getParam(2),
            "received-param-3-value" => $this->getParam(3)
        ];
    }
}

?>