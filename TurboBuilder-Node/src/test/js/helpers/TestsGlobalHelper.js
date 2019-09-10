#!/usr/bin/env node

'use strict';


/**
 * Helper that defines global methods to use with the turbobuilder tests
 * Helper modules are always executed once before all the tests run
 */

const path = require('path');


const executionDir = path.resolve('./');


// This line increases the number of available listeners to prevent the following warning:
// MaxListenersExceededWarning: Possible EventEmitter memory leak detected
// We can try to remove this line when node or jasmine are updated to see if the problem was caused by any of them
require('events').EventEmitter.defaultMaxListeners = 15;


/**
 * Switch the work directory back to the execution dir
 * @deprecated
 */
global.switchToExecutionDir = function() {

    // TODO - we must implement folder navigation on the terminal manager class.
    // Every time the terminal manager performs a directory change, it should be pushed into a stack so we
    // can then go back and forward, or directly to the beginning. This feature can be then used in this project
    // tests instead of this method (simply by returning back to the initial dir)
    process.chdir(executionDir);
}


// TODO - add all the methods from cmd-parameter-test-utils.js