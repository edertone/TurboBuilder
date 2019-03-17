# How to debug a node app with chrome dev tools


### 1 To launch a debug sesion

To debug the tests:
    
    Open a cmd
    npm run test-debug

To debug the application itself:

    Open a cmd at the folder where your application needs to be executed
    node --inspect-brk "PATH_TO_PROJECT\TurboBuilder-Node\src\main\js\turbobuilder.js" <any_required_parameters>
    
    Application will be paused at the very first line of code

### 2 Launch chrome

Open the browser, and natigate to:

    chrome://inspect

    Click the "Open dedicated DevTools for Node" link

### 3 Start debuggin