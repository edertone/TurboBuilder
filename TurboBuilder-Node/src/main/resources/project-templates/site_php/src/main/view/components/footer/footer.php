<?php

use org\turbosite\src\main\php\managers\WebSiteManager;

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['global']);

?>

<footer>

    <h4><?php $ws->echoText('FOOTER_TITLE', 'global') ?></h4>

    <p><?php $ws->echoText('DOC_GENERATED_IN_N_SECS', ['bundle' => 'global', 'toReplace' => $ws->getRunningTime()]) ?></p>

    <p>
        <a href="<?php $ws->echoUrlToChangeLocale('en_US') ?>">english</a>
         -
        <a href="<?php $ws->echoUrlToChangeLocale('es_ES') ?>">spanish</a>
    </p>

</footer>
