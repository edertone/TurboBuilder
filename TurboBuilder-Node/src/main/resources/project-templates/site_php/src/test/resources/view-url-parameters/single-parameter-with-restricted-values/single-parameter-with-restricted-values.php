<?php

use org\turbosite\src\main\php\managers\WebSiteManager;

// This view is used by tests to verify that a single parameter view redirects to the closest restricted value

/* jscpd:ignore-start */

$ws = WebSiteManager::getInstance();

$ws->initializeAsSingleParameterView('en', ['hello', 'world', 'string', 'facts']);

$ws->metaTitle = 'some title';
$ws->metaDescription = 'some description';

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

            <p><?php echo $ws->getUrlParam(0) ?></p>

        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoJavaScriptTags() ?>

</body>
</html>
<!--jscpd:ignore-end-->