<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Error 404 page not found</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>

        * {
            line-height: 1.2;
            margin: 0;
        }

        html {
            color: #888;
            display: table;
            font-family: sans-serif;
            height: 100%;
            text-align: center;
            width: 100%;
        }

        body {
            display: table-cell;
            vertical-align: middle;
            margin: 2em auto;
        }

        h1 {
            color: #555;
            font-size: 2em;
            font-weight: 400;
        }

        p {
            margin: 0 auto;
            width: 280px;
        }

        @media only screen and (max-width: 280px) {

            body, p {
                width: 95%;
            }

            h1 {
                font-size: 1.5em;
                margin: 0 0 0.3em;
            }

        }

    </style>
</head>
<body>
    <h1>Page Not Found</h1>
    <p>Sorry, but the page you were trying to view does not exist.</p>
    <br>
    <p>Redirecting to <?php echo $_SERVER['HTTP_HOST'] ?> in <span id="time">6</span> secs ...</p>

    <script>
        setTimeout(function(){document.getElementById('time').innerHTML="5"},1000);
        setTimeout(function(){document.getElementById('time').innerHTML="4"},2000);
        setTimeout(function(){document.getElementById('time').innerHTML="3"},3000);
        setTimeout(function(){document.getElementById('time').innerHTML="2"},4000);
        setTimeout(function(){document.getElementById('time').innerHTML="1"},5000);
        setTimeout(function(){window.location.href="/"}, 6000);
    </script>
</body>
</html>