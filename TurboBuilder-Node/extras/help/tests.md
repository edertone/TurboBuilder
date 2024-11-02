## OS Environment setup


### Chrome driver must be available on OS to run selenium tests. Download and help available here:

https://developer.chrome.com/docs/chromedriver/downloads

To avoid losing the executable, copy it inside program files / chromedriver

Add the chromedriver.exe to the windows path environment variable, so it is available
via standard windows cmd

test it by opening a cmd and typing chromedriver -v. It should show its version and other info


### Docker runtime must be available

Make sure the docker agent is running!


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

    - Create a temporary folder and run the following commands:
    - tb -g site_php
    - npm ci
    - tb -cbt
    - All tests must launch and pass
