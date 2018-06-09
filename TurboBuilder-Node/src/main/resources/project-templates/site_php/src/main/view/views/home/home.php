<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->initializeView();

$ws->loadBundles(['home']);

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

    <header>

        <img alt="" src="view/views/home/home-logo.svg">

        <h1><?php $ws->echoLoc('TITLE', 'home') ?></h1>

        <h2><?php $ws->echoLoc('SUBTITLE') ?></h2>

    </header>

    <main>

        <!-- Main content goes here -->
        <section>
        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

</body>

</html>