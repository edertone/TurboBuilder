<?php

use org\turbosite\src\main\php\managers\WebSiteManager;

$ws = WebSiteManager::getInstance();

$ws->initializeSingleParameterView('en', ['test parameter 1', 'testparameter2']);

$ws->metaTitle = $ws->getParam();
$ws->metaDescription = $ws->getParam();

?>
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
<?php $ws->echoHeadHtml() ?>
</head>

<body>

    <!-- TODO: Adapt this single parameter view template to your needs -->

    <?php $ws->includeComponent('view/components/main-menu/main-menu') ?>

    <main>

        <section>

            <h1><?php echo 'This is the single parameter view' ?></h1>

            <h4><?php echo 'You passed the following parameter value: '.$ws->getParam() ?></h4>

            <p><?php echo 'Use it to process data when only one parameter is enough. The only parameter restriction is to be more than 2 digits in length' ?></p>

        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoJavaScriptTags() ?>

</body>

</html>