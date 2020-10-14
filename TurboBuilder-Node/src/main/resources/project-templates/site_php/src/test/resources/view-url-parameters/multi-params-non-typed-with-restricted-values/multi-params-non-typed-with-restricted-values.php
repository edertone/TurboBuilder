<?php

use org\turbosite\src\main\php\managers\WebSiteManager;
use org\turbosite\src\main\php\model\WebViewSetup;

// This view is used by tests to verify that typed parameters work as expected

/* jscpd:ignore-start */

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['multi-parameters']);
$ws->metaTitle = 'blabla';
$ws->metaDescription = 'blabla';

$webViewSetup = new WebViewSetup();

$webViewSetup->enabledUrlParams = [
    [WebSiteManager::NOT_TYPED, ['1', '3', '5', '7']],
    [WebSiteManager::NOT_TYPED, ['hello', 'world', 'string']]
];

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

            <p><?php echo $ws->getUrlParam(0).$ws->getUrlParam(1) ?></p>

            <p><?php echo gettype($ws->getUrlParam(0)).gettype($ws->getUrlParam(1)) ?></p>

        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoHtmlJavaScriptTags() ?>

</body>
</html>
<!--jscpd:ignore-end-->