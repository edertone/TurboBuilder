<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();
$ws->loadBundles(['header']);

?>

<h1><?php $ws->echoLoc('TITLE') ?></h1>