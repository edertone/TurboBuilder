<?php

namespace project\src\main\api\site\example;

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

        $exampleServiceWithGetParams = new ExampleServiceWithGetParams(['param0', 'param1']);

        $result .= "ExampleServiceWithGetParams called. Result:\n";
        $result .= json_encode($exampleServiceWithGetParams->run());
        $result .= "\n\n";

        $exampleServiceWithGetParamsOptional = new ExampleServiceWithGetParamsOptional(['param0']);

        $result .= "ExampleServiceWithGetParamsOptional called. Result:\n";
        $result .= json_encode($exampleServiceWithGetParamsOptional->run());
        $result .= "\n\n";

        $exampleServiceWithPostParams = new ExampleServiceWithPostParams(null, 'data from constructor');

        $result .= "ExampleServiceWithPostParams called. Result:\n";
        $result .= json_encode($exampleServiceWithPostParams->run());
        $result .= "\n\n";

        $exampleServiceWithPostAndGetParams = new ExampleServiceWithPostAndGetParams(['param0', 'param1'], 'data from constructor');

        $result .= "ExampleServiceWithPostAndGetParams called. Result:\n";
        $result .= json_encode($exampleServiceWithPostAndGetParams->run());
        $result .= "\n\n";

        $exampleServiceWithPostAndGetParamsOptional = new ExampleServiceWithPostAndGetParamsOptional([], null);

        $result .= "ExampleServiceWithPostAndGetParamsOptional called. Result:\n";
        $result .= json_encode($exampleServiceWithPostAndGetParamsOptional->run());

        return $result."\n";
    }
}

?>