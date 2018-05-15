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
 * Header element
 */
class Header extends HTMLElementBase{


	/** Header constructor */
	public function __construct(){

		 // Load the header resource bundle
		App::importLocaleBundle('Header');
	}


	/**
	 * Get the component's HTML code
	 *
	 * @return void
	 */
	public function getHTML(){

		ob_start();

		?>

		<!-- Place HEADER html code here -->

		<?php

		return ob_get_clean();
	}
}

?>