<?php

use org\turbosite\src\main\php\managers\WebSiteManager;

// This view is used by tests to verify that a single parameter view will throw an error if getUrlParam() method is called with indices above 0

/* jscpd:ignore-start */

$ws = WebSiteManager::getInstance();

$ws->initializeAsSingleParameterView('en', ['param1']);

$ws->metaTitle = 'some title';
$ws->metaDescription = 'some description';

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

            <!--  This must throw an error -->
            <p><?php echo $ws->getUrlParam(1) ?></p>

        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoHtmlJavaScriptTags() ?>

</body>
</html>
<!--jscpd:ignore-end-->