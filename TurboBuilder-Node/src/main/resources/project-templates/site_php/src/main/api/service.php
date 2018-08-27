<?php

/**
 * TurboCommons is a general purpose and cross-language library that implements frequently used and generic software development tasks.
 *
 * Website : -> http://www.turbocommons.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


use com\edertone\turboProject\src\main\php\model\App;


App::initializeView();
// App::importCss('css/view/views/home/Home.css');

?>
<!DOCTYPE html>
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