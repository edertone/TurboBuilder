<?php

use org\turbosite\src\main\php\managers\WebServiceManager;

$service = WebServiceManager::getInstance();

$service->initializeService();

echo 'hello';

?>