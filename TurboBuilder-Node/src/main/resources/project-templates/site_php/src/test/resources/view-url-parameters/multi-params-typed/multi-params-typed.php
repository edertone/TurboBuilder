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
    [WebSiteManager::INT],
    [WebSiteManager::STRING, WebSiteManager::NOT_RESTRICTED],
    [WebSiteManager::ARRAY, WebSiteManager::NOT_RESTRICTED, 'default-param3']
];

$ws->initializeAsView($webViewSetup);

/* jscpd:ignore-end */

?>
<!--jscpd:ignore-start-->
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
<?php $ws->echoHeadHtml() ?>
</head>

<body>

    <?php $ws->includeComponent('view/components/main-menu/main-menu') ?>

    <main>

        <section>

            <p><?php echo $ws->getUrlParam(0).$ws->getUrlParam(1).implode('-', $ws->getUrlParam(2)) ?></p>

            <p><?php echo gettype($ws->getUrlParam(0)).gettype($ws->getUrlParam(1)).gettype($ws->getUrlParam(2)) ?></p>

        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoJavaScriptTags() ?>

</body>
</html>
<!--jscpd:ignore-end-->