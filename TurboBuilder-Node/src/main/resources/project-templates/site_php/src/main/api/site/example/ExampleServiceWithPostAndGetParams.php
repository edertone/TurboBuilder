<?php

namespace project\src\main\api\site\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that must be called with POST and GET parameters
 */
class ExampleServiceWithPostAndGetParams extends WebService{


    protected function setup(){

        $this->isPostDataEnabled = true;

        $this->enabledGetParams = 2;
    }


    public function run(){

        return [
            "info" => "this object is returned as a json string with the received GET and POST parameters values",
            "received-GET-param-0-value" => $this->getParam(0),
            "received-GET-param-1-value" => $this->getParam(1),
            "received-POST-params" => $this->getPostData()
        ];
    }
}

?>