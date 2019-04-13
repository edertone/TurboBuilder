<?php

use org\turbosite\src\main\php\managers\WebSiteManager;

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['home']);
$ws->metaTitle = $ws->getLoc('META_TITLE');
$ws->metaDescription = $ws->getLoc('META_DESCRIPTION');

$ws->initializeView();

?>
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
<?php $ws->echoHeadHtml() ?>
</head>

<body>

    <?php $ws->includeComponent('view/components/main-menu/main-menu') ?>

    <header>

        <img alt="" src="view/views/home/home-logo.svg">

        <h1><?php $ws->echoLoc('TITLE', 'home') ?></h1>

        <h2><?php $ws->echoLoc('SUBTITLE') ?></h2>

    </header>

    <main>

        <section>

            <h1><?php $ws->echoLoc('SECTION_TITLE') ?></h1>

            <h4><?php $ws->echoLoc('SECTION_CONTENT') ?></h4>

            <hr>

            <h1><?php $ws->echoLoc('SECTION_TITLE') ?></h1>

            <h4><?php $ws->echoLoc('SECTION_CONTENT') ?></h4>

        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoJavaScriptTags() ?>

</body>
</html>