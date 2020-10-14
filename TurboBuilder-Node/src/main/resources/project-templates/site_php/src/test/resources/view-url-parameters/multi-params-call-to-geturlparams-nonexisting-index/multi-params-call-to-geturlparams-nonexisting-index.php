<?php

use org\turbosite\src\main\php\managers\WebSiteManager;
use org\turbosite\src\main\php\model\WebViewSetup;

// This view is used by tests to verify that all mandatory url parameters works as expected

/* jscpd:ignore-start */

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['multi-parameters']);
$ws->metaTitle = 'blabla';
$ws->metaDescription = 'blabla';

$webViewSetup = new WebViewSetup();

$webViewSetup->enabledUrlParams = 2;

$ws->initializeAsView($webViewSetup);

/* jscpd:ignore-end */

?>
<!--jscpd:ignore-start-->
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
<?php $ws->echoHtmlHead() ?>
</head>

<body>

    <?php $ws->includeComponent('view/components/main-menu/main-menu') ?>

    <main>

        <section>

            <p><?php echo $ws->getUrlParam(0) ?></p>
            <p><?php echo $ws->getUrlParam(1) ?></p>
            <p><?php echo $ws->getUrlParam(2) ?></p>

        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoHtmlJavaScriptTags() ?>

</body>
</html>
<!--jscpd:ignore-end-->