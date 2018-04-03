#!/usr/bin/env node

'use strict';


/**
 * Version feature tests
 */


const utils = require('./index-utils.js');
const currentVersion = '0.0.4';


// Create and switch to the tests folder
utils.switchToDirInsideTemp('test-version');


// When -v argument is passed, application version is shown
utils.assertExecContains('-v', currentVersion, "Failed showing help");


// When -version argument is passed, application version is shown
utils.assertExecContains('-version', currentVersion, "Failed showing help");


//When -v argument is passed after creating an empty project, application version is shown
utils.exec('-g');
utils.assertExecContains('-v', currentVersion, "Failed showing help");


//When -version argument is passed after creating an empty project, application version is shown
utils.assertExecContains('-version', currentVersion, "Failed showing help");