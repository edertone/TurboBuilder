<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->initializeView();

$ws->loadBundles(['home']);

$ws->loadComponents([
    'view/components/header',
    'view/components/footer']);

$ws->metaTitle = $ws->getLoc('TITLE');
$ws->metaDescription = $ws->getLoc('DESCRIPTION');

?>
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
<?php $ws->echoHeadHtml() ?>
</head>

<body>

    <?php $ws->includeComponent('view/components/header/header') ?>

    <main>

        <!-- Main content goes here -->
        <section>
        </section>

    </main>

    <?php $ws->includeComponent('view/components/footer/footer') ?>

</body>

</html>