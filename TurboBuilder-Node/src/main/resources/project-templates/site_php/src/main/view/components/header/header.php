<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->loadBundles(['header']);

?>

<nav class="topBar">

</nav>

<header class="header">

    <h1><?php $ws->echoLoc('TITLE') ?></h1>

</header>

