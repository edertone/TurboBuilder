<?php


use com\edertone\turboProject\src\main\php\model\App;


App::initializeView();
// App::importCss('css/view/views/home/Home.css');

?>
<!doctype html>
<html lang="<?php echo App::getCurrentLanguage() ?>">

<head>
<?php
	App::echoHeadHtml();
?>
</head>

<body>

	<?php //(new Header())->echoHTML() ?>


	<!-- Place HTML BODY contents here -->


	<?php //(new Footer())->echoHTML() ?>

</body>

</html>