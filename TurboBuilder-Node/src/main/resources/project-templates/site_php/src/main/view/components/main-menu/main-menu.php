<?php

use org\turbosite\src\main\php\managers\WebSiteManager;

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['main-menu']);

?>

<nav>

    <section>

        <p><?php $ws->echoText('TITLE')?></p>

        <a href="<?php $ws->echoUrlToView($ws->getHomeView()) ?>">
            <?php $ws->echoText('HOME')?></a>

        <a href="<?php $ws->echoUrlToView($ws->getSingleParameterView(), 'test parameter 1') ?>">
            <?php $ws->echoText('SINGLE_PARAM')?></a>

        <a href="<?php $ws->echoUrlToView('multi-parameters', ['parameter 1', 'parameter 2', 'parameter 3']) ?>">
            <?php $ws->echoText('MULTI_PARAM')?></a>

    </section>

</nav>

