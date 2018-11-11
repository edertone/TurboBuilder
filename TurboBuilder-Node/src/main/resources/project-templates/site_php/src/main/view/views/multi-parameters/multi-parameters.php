<?php

use org\turbosite\src\main\php\managers\WebSiteManager;
use org\turbosite\src\main\php\model\WebViewSetup;

$ws = WebSiteManager::getInstance();

$webViewSetup = new WebViewSetup();

$webViewSetup->enabledParams = 3;
$webViewSetup->defaultParameters = ['default-param1', 'default-param2', 'default-param3'];

$ws->initializeView($webViewSetup);

$ws->loadBundles(['multi-parameters']);

$ws->metaTitle = $ws->getLoc('META_TITLE');
$ws->metaDescription = $ws->getLoc('META_DESCRIPTION');

?>
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
<?php $ws->echoHeadHtml() ?>
</head>

<body>

    <?php $ws->includeComponent('view/components/main-menu/main-menu') ?>

    <main>

        <section>



        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoJavaScriptTags() ?>

</body>
</html>