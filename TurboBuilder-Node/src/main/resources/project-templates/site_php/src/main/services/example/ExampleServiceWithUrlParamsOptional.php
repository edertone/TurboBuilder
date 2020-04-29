<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\managers\WebServiceManager;


/**
 * An example of a service that may be called with 4 URL optional parameters
 */
class ExampleServiceWithUrlParamsOptional extends WebServiceManager{


    protected function setup(){

        $this->enabledUrlParams[] = [WebServiceManager::NOT_TYPED, WebServiceManager::NOT_RESTRICTED, ''];
        $this->enabledUrlParams[] = [WebServiceManager::NOT_TYPED, WebServiceManager::NOT_RESTRICTED, ''];
        $this->enabledUrlParams[] = [WebServiceManager::NOT_TYPED, WebServiceManager::NOT_RESTRICTED, ''];
        $this->enabledUrlParams[] = [WebServiceManager::NOT_TYPED, WebServiceManager::NOT_RESTRICTED, ''];

        $this->authorizeMethod = function () { return true; };
    }


    public function run(){

        return [
            "info" => "this object is returned as a json string with the optionally received URL parameters values",
            "received-param-0-value" => $this->getUrlParam(0),
            "received-param-1-value" => $this->getUrlParam(1),
            "received-param-2-value" => $this->getUrlParam(2),
            "received-param-3-value" => $this->getUrlParam(3)
        ];
    }
}

?>