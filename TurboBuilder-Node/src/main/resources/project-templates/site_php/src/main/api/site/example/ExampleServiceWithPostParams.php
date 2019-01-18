<?php

namespace project\src\main\api\site\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that can be called with POST parameters
 */
class ExampleServiceWithPostParams extends WebService{


    public function setup(){

        $this->enablePostParams = true;
    }


    public function run(){

        // TODO

        return '';
    }
}

?>