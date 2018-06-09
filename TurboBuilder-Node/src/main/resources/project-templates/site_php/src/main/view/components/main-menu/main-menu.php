<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->loadBundles(['main-menu']);

?>

<nav>

    <section>

        <p><?php $ws->echoLoc('TITLE')?></p>

        <a><?php $ws->echoLoc('HOME')?></a>

        <a><?php $ws->echoLoc('SINGLE_PARAM')?></a>

        <a><?php $ws->echoLoc('MULTI_PARAM')?></a>

    </section>

</nav>

