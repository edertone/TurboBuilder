<?php

namespace project\src\main\services\example;

use org\turbosite\src\main\php\managers\WebServiceManager;


/**
 * An example of a service that calls all the other ones via code
 */
class ExampleServiceThatCallsAnotherOneService extends WebServiceManager{


    protected function setup(){

        $this->authorizeMethod = function () { return true; };
    }


    public function run(){

        // This service outputs the results for all the different service examples but
        // instead of calling them via http request, we run them via php code

        $exampleServiceWithoutParams = new ExampleServiceWithoutParamsService();

        $result = "ExampleServiceWithoutParams called. Result:\n";
        $result .= json_encode($exampleServiceWithoutParams->run());
        $result .= "\n\n";

        $exampleServiceWithUrlParams = new ExampleServiceWithUrlParamsService(['param0', 'param1']);

        $result .= "ExampleServiceWithUrlParams called. Result:\n";
        $result .= json_encode($exampleServiceWithUrlParams->run());
        $result .= "\n\n";

        $exampleServiceWithUrlParamsOptional = new ExampleServiceWithUrlParamsOptionalService(['param0']);

        $result .= "ExampleServiceWithUrlParamsOptional called. Result:\n";
        $result .= json_encode($exampleServiceWithUrlParamsOptional->run());
        $result .= "\n\n";

        $exampleServiceWithPostParams = new ExampleServiceWithPostParamsService(null, ['param1' => 'p1 value', 'param2' => 'p2 value']);

        $result .= "ExampleServiceWithPostParams called. Result:\n";
        $result .= json_encode($exampleServiceWithPostParams->run());
        $result .= "\n\n";

        $exampleServiceWithPostAndUrlParams = new ExampleServiceWithPostAndUrlParamsService(['param0', 'param1'], ['data' => 'data from constructor']);

        $result .= "ExampleServiceWithPostAndUrlParams called. Result:\n";
        $result .= json_encode($exampleServiceWithPostAndUrlParams->run());
        $result .= "\n\n";

        $exampleServiceWithPostAndUrlParamsOptional = new ExampleServiceWithPostAndUrlParamsOptionalService([], null);

        $result .= "ExampleServiceWithPostAndUrlParamsOptional called. Result:\n";
        $result .= json_encode($exampleServiceWithPostAndUrlParamsOptional->run());
        $result .= "\n\n";

        $exampleServiceWithPostAndUrlParamsOptional = new ExampleServiceWithPostAndUrlParamsOptionalService(['p1', 'p2'], ['data' => 'datavalue']);

        $result .= "ExampleServiceWithPostAndUrlParamsOptional called 2. Result:\n";
        $result .= json_encode($exampleServiceWithPostAndUrlParamsOptional->run());
        $result .= "\n\n";

        $exampleServiceThatThrows400BadRequest = new ExampleServiceThatThrows400BadRequestService();

        $result .= "ExampleServiceThatThrows400BadRequest called. Result:\n";
        $result .= json_encode($exampleServiceThatThrows400BadRequest->run());

        return $result."\n";
    }
}

?>