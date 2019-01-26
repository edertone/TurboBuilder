<?php

namespace project\src\main\api\site\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that can be called with POST or GET parameters
 */
class ExampleServiceWithPostAndGetParams extends WebService{


    protected function setup(){

        $this->enablePostParams = true;

        // We will accept 3 get parameters
        $this->enabledGetParams = 3;
    }


    public function run(){

        // TODO

        return '';
    }
}

?>