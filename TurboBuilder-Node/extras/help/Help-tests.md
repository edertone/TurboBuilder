# How to launch project tests


### via command line

Launch any of the following commands at the root of the project (both do exactly the same):
	npm test
	node node_modules/jasmine/bin/jasmine --config=src/test/js/jasmine.json
	
## OS Environment setup

### Chrome driver must be available on OS to run selenium tests. Download and help available here:

https://sites.google.com/a/chromium.org/chromedriver/

To avoid losing the executable, copy it inside program files / chromedriver

Add the chromedriver.exe to the windows path environment variable, so it is available
via standard windows cmd

test it by opening a cmd and typing chromedriver. It should show its version and other info

