<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->initializeSingleParameterView();

$ws->metaTitle = $ws->getParam();
$ws->metaDescription = $ws->getParam();

?>
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
    <?php $ws->echoHeadHtml() ?>
</head>

<body>

	<h1><?php echo 'This is the single parameter view' ?></h1>

    <p><?php echo 'Use it to process data when only one parameter is enough. The only parameter restriction is to be more than 2 digits in length' ?></p>

</body>

</html>