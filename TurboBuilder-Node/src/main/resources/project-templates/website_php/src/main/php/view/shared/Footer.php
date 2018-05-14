<?php

/**
 * TurboCommons is a general purpose and cross-language library that implements frequently used and generic software development tasks.
 *
 * Website : -> http://www.turbocommons.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


/**
 * Footer element
 */
class Footer extends HTMLElementBase{


	/** Footer constructor */
	public function __construct(){

		 // Load the footer resource bundle
		App::importLocaleBundle('Footer');

		// Use this method if you need to get the page generation time
		//echo App::getRunningTime();
	}


	/**
	 * Get the component's HTML code
	 *
	 * @return void
	 */
	public function getHTML(){

		ob_start();

		?>

		<!-- Place FOOTER html code here -->

		<?php

		return ob_get_clean();
	}
}

?>