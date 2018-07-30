# How to launch project tests


### via command line

Launch any of the following commands at the root of the project (both do exactly the same):
	npm test
	node node_modules/jasmine/bin/jasmine --config=src/test/js/jasmine.json
	
### via eclipse

Create an external launch configuration:

	- name it Turbobuilder tests ALL
	- location: C:\Windows\System32\cmd.exe
	- Working directory: ${workspace_loc:/TurboBuilder-Node}
	- Arguments: "/c npm test"
	- Disable Build before launch on build tab
	
	
# How to launch only a subset of the project tests
	
Edit the file under: src/test/js/jasmine.json

And modify the "spec_files" section to look only for the spec file or files you want. 

	
## OS Environment setup

### Chrome driver must be available on OS to run selenium tests. Download and help available here:

https://sites.google.com/a/chromium.org/chromedriver/

To avoid losing the executable, copy it inside program files / chromedriver

Add the chromedriver.exe to the windows path environment variable, so it is available
via standard windows cmd

test it by opening a cmd and typing chromedriver. It should show its version and other info

### Create a symlink from C:/turbosite-webserver-symlink to your local http webserver web root folder

Launch the following command:

mklink /J C:\turbosite-webserver-symlink C:\xampp\htdocs

To create a hard symlink to the xampp webserver htdocs folder for example

Make sure the web server is running while launching tests!