<?php


// Register the autoload method that will locate and automatically load the classes
spl_autoload_register(function($className){

    if(strpos($className, 'tbsite\\src\\') === 0 && !class_exists($className)){

        // Replace all slashes to the correct OS directory separator
        $classPath = str_replace('\\', DIRECTORY_SEPARATOR, str_replace('/', DIRECTORY_SEPARATOR, $className));

        // Remove unwanted classname path parts
        $classPath = explode('src'.DIRECTORY_SEPARATOR.'main'.DIRECTORY_SEPARATOR, $classPath);

        require_once __DIR__.DIRECTORY_SEPARATOR.array_pop($classPath).'.php';
    }
});

?>