<?php

/**
 * TurboCommons is a general purpose and cross-language library that implements frequently used and generic software development tasks.
 *
 * Website : -> http://www.turbocommons.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */

require_once '../../../libs/libEdertonePhp/model/ProjectPaths.php';
require_once  ProjectPaths::MODEL.'/App.php';

App::initializeView(1, true);

importPhpFolder(ProjectPaths::MODEL);
importPhpFolder(ProjectPaths::SERVER_MODEL);
importPhpFolder(ProjectPaths::SERVER_CONTROLLER);
importPhpFolder(ProjectPaths::LIB_EDERTONE_PHP_VIEW_ELEMENTS);
importPhpFolder(ProjectPaths::VIEW_SHARED);

App::importCss('css/view/views/newDetail/NewDetail.css');

/* @var $new EntityNew */
$new = ControlNews::initializeNewDetailView(App::getParam(1))->data;

$newContent = StringUtils::removeHtmlCode($new->getLocalizedProperty('content'), '<p><a><b><li><br><u>');

?>
<!DOCTYPE html>
<html lang="<?php echo App::getCurrentLanguage() ?>">

<head>
<?php
	App::echoHeadHtml();
?>
</head>

<body>

	<?php (new Header())->echoHTML() ?>

	<!-- Place HTML BODY contents here -->
	<h1><?php echo $new->getLocalizedProperty('title') ?></h1>

	<img alt="" src="<?php App::echoUrlToPicture($new->pictures[0]->id, 'full', '') ?>">

	<div class="newContent"><?php echo $newContent ?></div>

	<?php (new Footer())->echoHTML() ?>

</body>

</html>