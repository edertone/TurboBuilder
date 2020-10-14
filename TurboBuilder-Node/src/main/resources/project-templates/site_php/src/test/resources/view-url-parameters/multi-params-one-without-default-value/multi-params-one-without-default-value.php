<?php

use org\turbosite\src\main\php\model\WebViewSetup;
use org\turbosite\src\main\php\managers\WebSiteManager;

// This view is used by tests to verify that url parameter without a default value works as expected

/* jscpd:ignore-start */

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['multi-parameters']);
$ws->metaTitle = $ws->getText('META_TITLE');
$ws->metaDescription = $ws->getText('META_DESCRIPTION');

$webViewSetup = new WebViewSetup();

$webViewSetup->enabledUrlParams = [
    [WebSiteManager::NOT_TYPED, WebSiteManager::NOT_RESTRICTED, 'default-param1'],
    [WebSiteManager::NOT_TYPED, WebSiteManager::NOT_RESTRICTED],
    [WebSiteManager::NOT_TYPED, WebSiteManager::NOT_RESTRICTED, 'default-param3']
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

    <main>
    </main>

<?php $ws->echoHtmlJavaScriptTags() ?>

</body>
</html>
<!--jscpd:ignore-end-->