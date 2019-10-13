<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\model\WebService;


/**
 * An example of a service that calls all the other ones via code
 */
class ExampleServiceThatCallsAnotherOne extends WebService{


    protected function setup(){

    }


    public function run(){

        // This service outputs the results for all the different service examples but
        // instead of calling them via http request, we run them via php code

        $exampleServiceWithoutParams = new ExampleServiceWithoutParams();

        $result = "ExampleServiceWithoutParams called. Result:\n";
        $result .= json_encode($exampleServiceWithoutParams->run());
        $result .= "\n\n";

        $exampleServiceWithUrlParams = new ExampleServiceWithUrlParams(['param0', 'param1']);

        $result .= "ExampleServiceWithUrlParams called. Result:\n";
        $result .= json_encode($exampleServiceWithUrlParams->run());
        $result .= "\n\n";

        $exampleServiceWithUrlParamsOptional = new ExampleServiceWithUrlParamsOptional(['param0']);

        $result .= "ExampleServiceWithUrlParamsOptional called. Result:\n";
        $result .= json_encode($exampleServiceWithUrlParamsOptional->run());
        $result .= "\n\n";

        $exampleServiceWithPostParams = new ExampleServiceWithPostParams(null, ['param1' => 'p1 value', 'param2' => 'p2 value']);

        $result .= "ExampleServiceWithPostParams called. Result:\n";
        $result .= json_encode($exampleServiceWithPostParams->run());
        $result .= "\n\n";

        $exampleServiceWithPostAndUrlParams = new ExampleServiceWithPostAndUrlParams(['param0', 'param1'], ['data' => 'data from constructor']);

        $result .= "ExampleServiceWithPostAndUrlParams called. Result:\n";
        $result .= json_encode($exampleServiceWithPostAndUrlParams->run());
        $result .= "\n\n";

        $exampleServiceWithPostAndUrlParamsOptional = new ExampleServiceWithPostAndUrlParamsOptional([], null);

        $result .= "ExampleServiceWithPostAndUrlParamsOptional called. Result:\n";
        $result .= json_encode($exampleServiceWithPostAndUrlParamsOptional->run());
        $result .= "\n\n";

        $exampleServiceWithPostAndUrlParamsOptional = new ExampleServiceWithPostAndUrlParamsOptional(['p1', 'p2'], ['data' => 'datavalue']);

        $result .= "ExampleServiceWithPostAndUrlParamsOptional called 2. Result:\n";
        $result .= json_encode($exampleServiceWithPostAndUrlParamsOptional->run());
        $result .= "\n\n";

        $exampleServiceThatThrows400BadRequest = new ExampleServiceThatThrows400BadRequest();

        $result .= "ExampleServiceThatThrows400BadRequest called. Result:\n";
        $result .= json_encode($exampleServiceThatThrows400BadRequest->run());

        return $result."\n";
    }
}

?>