<?php

use org\turbosite\src\main\php\managers\WebSiteManager;
use org\turbosite\src\main\php\model\WebViewSetup;

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['multi-parameters']);
$ws->metaTitle = $ws->getText('META_TITLE');
$ws->metaDescription = $ws->getText('META_DESCRIPTION');

$webViewSetup = new WebViewSetup();

$webViewSetup->enabledUrlParams = [
    [WebSiteManager::NOT_TYPED, WebSiteManager::NOT_RESTRICTED, 'default-param1'],
    [WebSiteManager::NOT_TYPED, WebSiteManager::NOT_RESTRICTED, 'default-param2'],
    [WebSiteManager::NOT_TYPED, WebSiteManager::NOT_RESTRICTED, 'default-param3']
];

$ws->initializeAsView($webViewSetup);

?>
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
<?php $ws->echoHtmlHead() ?>
</head>

<body>

    <!-- TODO: Adapt this multi parameters view template to your needs -->

    <?php $ws->includeComponent('view/components/main-menu/main-menu') ?>

    <main>

        <section>



        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoHtmlJavaScriptTags() ?>

</body>
</html>