<?php

use org\turbosite\src\main\php\model\WebSite;

$ws = WebSite::getInstance();

$ws->initializeView();

?>
<!doctype html>
<html lang="<?php echo $ws->getPrimaryLanguage() ?>">

<head>
    <?php $ws->echoHeadHtml() ?>
</head>

<body>

	<?php //(new Header())->echoHTML() ?>


	<!-- Place HTML BODY contents here -->


	<?php //(new Footer())->echoHTML() ?>

</body>

</html>