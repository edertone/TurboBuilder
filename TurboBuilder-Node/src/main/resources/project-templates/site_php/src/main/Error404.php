<!DOCTYPE html>
<html>

<head>
	<title>Error 404 page not found</title>
</head>

<body>
<?php

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