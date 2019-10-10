<?php

use org\turbosite\src\main\php\managers\WebSiteManager;
use org\turbosite\src\main\php\model\WebViewSetup;

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['multi-parameters']);
$ws->metaTitle = $ws->getText('META_TITLE');
$ws->metaDescription = $ws->getText('META_DESCRIPTION');

$webViewSetup = new WebViewSetup();

$webViewSetup->enabledGetParams = 3;
$webViewSetup->defaultParameters = ['default-param1', 'default-param2', 'default-param3'];

$ws->initializeAsView($webViewSetup);

?>
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
<?php $ws->echoHeadHtml() ?>
</head>

<body>

    <!-- TODO: Adapt this multi parameters view template to your needs -->

    <?php $ws->includeComponent('view/components/main-menu/main-menu') ?>

    <main>

        <section>



        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoJavaScriptTags() ?>

</body>
</html>