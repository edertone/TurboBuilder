<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that may be called with 4 GET optional parameters
 */
class ExampleServiceWithGetParamsOptional extends WebService{


    protected function setup(){

        $this->enabledGetParams[] = [WebService::NOT_TYPED, WebService::NOT_RESTRICTED, ''];
        $this->enabledGetParams[] = [WebService::NOT_TYPED, WebService::NOT_RESTRICTED, ''];
        $this->enabledGetParams[] = [WebService::NOT_TYPED, WebService::NOT_RESTRICTED, ''];
        $this->enabledGetParams[] = [WebService::NOT_TYPED, WebService::NOT_RESTRICTED, ''];
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