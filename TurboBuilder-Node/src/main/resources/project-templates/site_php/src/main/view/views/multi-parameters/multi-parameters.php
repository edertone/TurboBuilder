<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->initializeView(3);

$ws->loadBundles(['multi-parameters']);

$ws->loadComponents([
    'view/components/main-menu',
    'view/components/footer']);

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