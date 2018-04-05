#!/usr/bin/env node

'use strict';


/**
 * This script launches the tests for the turbobuilder project
 * Run it with : npm test
 */


const console = require('./../../main/js/console');
const utils = require('./index-utils');


// Call all the tests
require('./test-version');
require('./test-help');
require('./test-generate');


// Reaching here means all tests succeeded
console.success("All tests passed");