<?php

namespace project\src\main\api\site\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service with get parameters
 */
class ExampleServiceWithGetParams extends WebService{


    protected function setup(){

        // We will accept two get parameters
        $this->enabledGetParams = 2;
    }


    public function run(){

        $result = [
            "info" => "this object is returned as a json string with the received GET parameters values",
            "received-param-0-value" => $this->getParam(0),
            "received-param-1-value" => $this->getParam(1)
        ];

        return json_encode($result);
    }
}

?>