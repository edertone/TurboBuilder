<?php

/**
 * TurboCommons is a general purpose and cross-language library that implements frequently used and generic software development tasks.
 *
 * Website : -> http://www.turbocommons.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */

?>

<!DOCTYPE html>
<html>

<head>
	<title>Error 404 page not found</title>
</head>

<body>
<?php

	// TODO: el missatge hauria de ser localitzat en els idiomes més frequents, i si no angles per defecte
	echo 'Sorry, this page was not found (404 error). Redirecting to home in <p id="time" style="display:inline">5</p> secs ...';

?>
<script>
	setTimeout(function(){document.getElementById('time').innerHTML="4"},1000);
	setTimeout(function(){document.getElementById('time').innerHTML="3"},2000);
	setTimeout(function(){document.getElementById('time').innerHTML="2"},3000);
	setTimeout(function(){document.getElementById('time').innerHTML="1"},4000);
	setTimeout(function(){window.location.href="/"}, 5000);
</script>

</body>
</html>