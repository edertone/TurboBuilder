<?php

/**
 * TurboCommons is a general purpose and cross-language library that implements frequently used and generic software development tasks.
 *
 * Website : -> http://www.turbocommons.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */

namespace com\edertone\turboProject\src\main\php\model;

use com\edertone\turboERP\src\main\php\model\Application;


/**
 * Application class is extended and used as the main app model object on our application
 */
class App extends Application {


	// Define custom app properties, constants or methods here

	// example: E-MAIL where the form messages will be sent
	// const FORM_SUBMIT_MAIL = 'mail here';


	/**
	 * Perform all the App object initializations here: Set variables, global JS or Css imports, Global initializations...
	 * Do not call this method. It is called automatically at the index entry point
	 *
	 * @return void
	 */
	public static function construct(){

		parent::construct();

		//self::importCss('css/libs/animate/Animate.css');
		//self::importCss('css/view/shared/Document.css');

		/*
		 self::importJs('js/libs/libEdertoneJS/utils/StringUtils.js');
		 self::importJs('js/libs/libEdertoneJS/utils/ObjectUtils.js');
		 self::importJs('js/libs/libEdertoneJS/utils/CookiesUtils.js');
		 self::importJs('js/libs/libEdertoneJS/utils/LayoutUtils.js');
		 self::importJs('js/libs/libEdertoneJS/utils/HtmlUtils.js');
		 self::importJs('js/libs/libEdertoneJS/utils/BrowserUtils.js');
		 self::importJs('js/libs/libEdertoneJS/utils/SerializationUtils.js');
		 self::importJs('js/libs/libEdertoneJS/managers/ValidationManager.js');
		 self::importJs('js/libs/libEdertoneJS/managers/PopUpManager.js');
		 self::importJs('js/libs/libEdertoneJS/model/ModelAppBase.js');
		 self::importJs('js/model/App.js');
		 self::importJs('js/view/shared/Document.js');
		 self::importJsMerge();
		*/
	}
}

?>