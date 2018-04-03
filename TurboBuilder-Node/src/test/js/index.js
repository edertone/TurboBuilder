#!/usr/bin/env node

'use strict';


/**
 * This script launches the tests for the turbobuilder project
 * Run it with : npm test
 */


const consoleModule = require('./../../main/js/console.js');


// Call all the tests
require('./test-version.js');
require('./test-help.js');


// Reaching here means all tests succeeded
consoleModule.success("All tests passed");