<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();
$ws->loadBundles(['footer']);

?>

<h4><?php $ws->echoLoc('TITLE') ?></h4>

<p><?php $ws->echoLoc('DOC_GENERATED_IN_N_SECS',
        ['bundle' => 'footer', 'wildcards' => '$N', 'replace' => $ws->getRunningTime()]) ?></p>