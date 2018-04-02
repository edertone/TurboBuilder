#!/usr/bin/env node

'use strict';


/**
 * test application version feature
 */


const { execSync } = require('child_process');
const consoleModule = require('./../../main/js/console.js');


let execResult = '';
const expectedVersion = '0.0.4';


// When -v argument is passed, application version is shown
execResult = execSync(global.pathToExecutable + ' -v', {stdio : 'pipe'});

if(execResult.toString().indexOf(expectedVersion) < 0){

    consoleModule.error("Failed showing help: " + execResult.toString(), true);
}


//When -version argument is passed, application version is shown
execResult = execSync(global.pathToExecutable + ' -version', {stdio : 'pipe'});

if(execResult.toString().indexOf(expectedVersion) < 0){

    consoleModule.error("Failed showing help: " + execResult.toString(), true);
}