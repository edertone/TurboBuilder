<?php

namespace project\src\main\api\site\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that must be called with POST parameters
 */
class ExampleServiceWithPostParams extends WebService{


    protected function setup(){

        $this->isPostDataEnabled = true;
    }


    public function run(){

        return [
            "info" => "this object is returned as a json string with the received POST parameters object",
            "received-params" => $this->getPostData()
        ];
    }
}

?>