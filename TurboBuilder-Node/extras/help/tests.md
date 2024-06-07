## OS Environment setup


### Chrome driver must be available on OS to run selenium tests. Download and help available here:

https://sites.google.com/a/chromium.org/chromedriver/

To avoid losing the executable, copy it inside program files / chromedriver

Add the chromedriver.exe to the windows path environment variable, so it is available
via standard windows cmd

test it by opening a cmd and typing chromedriver -v. It should show its version and other info


### A web server with mysql / mariadb database must be available and running

Make sure the web server and database server are running while launching tests!


### Create a symlink from C:/turbosite-webserver-symlink to your local http webserver web root folder

Launch the following command:

mklink /J C:\turbosite-webserver-symlink C:\xampp\htdocs

To create a hard symlink to the webserver htdocs folder for example


### Disable Google analytics on your local windows machine to avoid data to be sent to your site by the tests

Edit the windows hosts file: "C:\Windows\System32\drivers\etc\hosts"

Put the following lines at the end:

    127.0.0.1 google-analytics.com
    127.0.0.1 www.google-analytics.com
    127.0.0.1 ssl.google-analytics.com
    127.0.0.1 googletagmanager.com
    127.0.0.1 www.googletagmanager.com
    
Restart your computer


# How to launch project tests

### via command line

Launch any of the following commands at the root of the project (both do exactly the same):

    - tb -btl (if we want to launch the tests and also validate the project)
    - npm test (to only launch the tests)
    - node node_modules/jasmine/bin/jasmine --config=src/test/js/jasmine.json (to only launch the tests)
    
### via eclipse

Create an external launch configuration:

    - name it Turbobuilder tests ALL
    - location: C:\Windows\System32\cmd.exe
    - Working directory: ${workspace_loc:/TurboBuilder-Node}
    - Arguments: "/c tb -bt"
    - Disable Build before launch on build tab
    
    
# How to launch only a subset of the project tests
    
Edit the file under: src/test/js/jasmine.json

And modify the "spec_files" section to look only for the spec file or files you want. 


# How to launch only the site_php template tests

site_php template contains multiple tests by default to verify that it works as expected. If we only want to launch these, we can use the following method:

    - Copy the file site_php-build-and-test-template.bat from the extras/bats folder into your desktop
    - Edit the file variables located at the top to fit your OS paths
    - Launch the bat file
    - All tests must launch and pass 
