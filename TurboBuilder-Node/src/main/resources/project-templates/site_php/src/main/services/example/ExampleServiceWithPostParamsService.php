<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\managers\WebServiceManager;


/**
 * An example of a service that must be called with POST parameters
 */
class ExampleServiceWithPostParamsService extends WebServiceManager{


    protected function setup(){

        $this->enabledPostParams[] = ['param1'];
        $this->enabledPostParams[] = ['param2'];

        $this->authorizeMethod = function () { return true; };
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