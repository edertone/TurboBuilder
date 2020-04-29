<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\managers\WebServiceManager;


/**
 * An example of a service that may be called with POST or URL parameters
 */
class ExampleServiceWithPostAndUrlParamsOptional extends WebServiceManager{


    protected function setup(){

        $this->enabledUrlParams = [
            [WebServiceManager::NOT_TYPED, WebServiceManager::NOT_RESTRICTED, ''],
            [WebServiceManager::NOT_TYPED, WebServiceManager::NOT_RESTRICTED, ''],
            [WebServiceManager::NOT_TYPED, WebServiceManager::NOT_RESTRICTED, '']
        ];

        $this->enabledPostParams[] = ['data', WebServiceManager::NOT_TYPED, WebServiceManager::NOT_REQUIRED];

        $this->authorizeMethod = function () { return true; };
    }


    public function run(){

        return [
            "info" => "this object is returned as a json string with the optionally received URL and POST parameters values",
            "received-POST-param-data" => $this->getPostParam('data'),
            "received-URL-param-0-value" => $this->getUrlParam(0),
            "received-URL-param-1-value" => $this->getUrlParam(1),
            "received-URL-param-2-value" => $this->getUrlParam(2)
        ];
    }
}

?>