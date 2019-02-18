# How to update this project to the latest framework version


1- Make sure turbobuilder is updated to the latest version

2- Update the turbobuilder expected version on this project's turbobuilder.json file

3- Create a tmpfolder and generate a default site_php or server_php project (the same as yours):

    tb -g site_php
    tb -g server_php

4- Update this file with the one created at the generated temporary folder

5- Overwrite all the files found at src/main with the ones on tmpfolder
   (if you have modified any of them, you should update them manually):

    src/main/error-404.php
    src/main/htaccess.txt
    src/main/index.php
    src/main/robots.txt

6- Overwrite all the libraries found at src/main/libs/ with the ones on tmpfolder

7- Review that turbosite.json and turbobuilder.json are valid compared to the generated ones

7- Review extras folder for outdated documentation

8- Review any other files that may be worth comparing for update