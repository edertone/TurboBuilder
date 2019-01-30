<?php

namespace project\src\main\api\site\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that may be called with POST or GET parameters
 */
class ExampleServiceWithPostAndGetParamsOptional extends WebService{


    protected function setup(){

        $this->isPostDataEnabled = true;

        $this->isPostDataMandatory = false;

        $this->enabledGetParams = 3;

        $this->isGetDataMandatory = false;
    }


    public function run(){

        $result = [
            "info" => "this object is returned as a json string with the optionally received GET and POST parameters values",
            "received-GET-param-0-value" => $this->getParam(0),
            "received-GET-param-1-value" => $this->getParam(1),
            "received-GET-param-2-value" => $this->getParam(2),
            "received-POST-params" => $this->getPostData()
        ];

        return json_encode($result);
    }
}

?>