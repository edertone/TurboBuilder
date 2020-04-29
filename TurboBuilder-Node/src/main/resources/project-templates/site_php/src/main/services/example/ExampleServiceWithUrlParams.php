<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\managers\WebServiceManager;


/**
 * An example of a service that must be called with get parameters
 */
class ExampleServiceWithUrlParams extends WebServiceManager{


    protected function setup(){

        $this->enabledUrlParams = 2;

        $this->authorizeMethod = function () { return true; };
    }


    public function run(){

        return [
            "info" => "this object is returned as a json string with the received URL parameters values",
            "received-param-0-value" => $this->getUrlParam(0),
            "received-param-1-value" => $this->getUrlParam(1)
        ];
    }
}

?>