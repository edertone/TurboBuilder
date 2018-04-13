# How to debug with chrome dev tools


### 1 Launch a debug sesion

To debug the tests:

	npm run test-debug

To debug the application itself:

	node --inspect-brk "PATH_TO_PROJECT\TurboBuilder-Node\src\main\js\turbobuilder.js"

Application will be paused at the very first line of code

### Launch chrome

Open the browser, and natigate to:

chrome://inspect

Click the "Open dedicated DevTools for Node" link

### Start debuggin