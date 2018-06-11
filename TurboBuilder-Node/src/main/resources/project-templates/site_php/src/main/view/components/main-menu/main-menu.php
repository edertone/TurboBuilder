<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->loadBundles(['main-menu']);

?>

<nav>

    <section>

        <p><?php $ws->echoLoc('TITLE')?></p>

        <a href="<?php $ws->echoUrlToView($ws->getHomeView()) ?>">
            <?php $ws->echoLoc('HOME')?></a>

        <a href="<?php $ws->echoUrlToView($ws->getSingleParameterView(), 'some parameter') ?>">
            <?php $ws->echoLoc('SINGLE_PARAM')?></a>

        <a href="<?php $ws->echoUrlToView('multi-parameters', ['parameter 1', 'parameter 2', 'parameter 3']) ?>">
            <?php $ws->echoLoc('MULTI_PARAM')?></a>

    </section>

</nav>

