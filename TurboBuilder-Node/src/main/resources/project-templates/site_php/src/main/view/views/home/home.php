<?php

use org\turbosite\src\main\php\managers\WebSiteManager;

$ws = WebSiteManager::getInstance();

$ws->loadBundles(['home']);
$ws->metaTitle = $ws->getText('META_TITLE');
$ws->metaDescription = $ws->getText('META_DESCRIPTION');

$ws->initializeAsView();

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

        <h1><?php $ws->echoText('TITLE', 'home') ?></h1>

        <h2><?php $ws->echoText('SUBTITLE') ?></h2>

    </header>

    <main>

        <section>

            <h1><?php $ws->echoText('SECTION_TITLE') ?></h1>

            <h4><?php $ws->echoText('SECTION_CONTENT') ?></h4>

            <hr>

            <h1><?php $ws->echoText('SECTION_TITLE') ?></h1>

            <h4><?php $ws->echoText('SECTION_CONTENT') ?></h4>

        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

<?php $ws->echoJavaScriptTags() ?>

</body>
</html>