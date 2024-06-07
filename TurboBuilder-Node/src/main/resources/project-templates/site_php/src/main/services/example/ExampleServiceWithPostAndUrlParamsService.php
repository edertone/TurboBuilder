<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\managers\WebServiceManager;


/**
 * An example of a service that must be called with POST and URL parameters
 */
class ExampleServiceWithPostAndUrlParamsService extends WebServiceManager{


    protected function setup(){

        $this->authorizeMethod = function () { return true; };

        $this->enabledPostParams[] = ['data'];

        $this->enabledUrlParams = 2;
    }


    public function run(){

        return [
            "info" => "this object is returned as a json string with the received URL and POST parameters values",
            "received-URL-param-0-value" => $this->getUrlParam(0),
            "received-URL-param-1-value" => $this->getUrlParam(1),
            "received-POST-params" => $this->getPostParam('data')
        ];
    }
}

?>