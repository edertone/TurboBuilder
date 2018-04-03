#!/usr/bin/env node

'use strict';


/**
 * Help feature tests
 */


const utils = require('./index-utils.js');


// Create and switch to the tests folder
utils.switchToDirInsideTemp('test-help');


// When -h argument is passed, application help is shown
utils.assertExecContains('-h', "Usage: turbobuilder|tb [options]", "Failed -h argument");


// When -help argument is passed, application help is shown
utils.assertExecContains('-help', "Usage: turbobuilder|tb [options]", "Failed -help argument");


// When launched without args on the empty tests folder, help info is shown
utils.assertExecContains('', "Usage: turbobuilder|tb [options]", "Failed without arguments");


//When -h argument is passed after creating an empty project, application version is shown
utils.exec('-g');
utils.assertExecContains('-h', "Usage: turbobuilder|tb [options]", "Failed showing help");


//When -help argument is passed after creating an empty project, application version is shown
utils.assertExecContains('-help', "Usage: turbobuilder|tb [options]", "Failed showing help");


//When launched without args after creating an empty project, application version is shown
utils.assertExecContains('', "Usage: turbobuilder|tb [options]", "Failed showing help");