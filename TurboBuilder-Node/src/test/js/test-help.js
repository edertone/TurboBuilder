#!/usr/bin/env node

'use strict';


/**
 * Help feature tests
 */


const { execSync } = require('child_process');
const consoleModule = require('./../../main/js/console.js');


let execResult = '';
const expectedHelp = "Usage: turbobuilder|tb [options]";


//When -h argument is passed, application help is shown
execResult = execSync(global.pathToExecutable + ' -h', {stdio : 'pipe'});

if(execResult.toString().indexOf(expectedHelp) < 0){

    consoleModule.error("Failed -h argument " + execResult.toString(), true);
}


//When -help argument is passed, application help is shown
execResult = execSync(global.pathToExecutable + ' -help', {stdio : 'pipe'});

if(execResult.toString().indexOf(expectedHelp) < 0){

    consoleModule.error("Failed -help argument " + execResult.toString(), true);
}


// When launched without args on an empty folder, help info is shown   
process.chdir(__dirname + '/../resources/nonexistant-project');

execResult = execSync(global.pathToExecutable, {stdio : 'pipe'});

if(execResult.toString().indexOf(expectedHelp) < 0){

    consoleModule.error("Failed without arguments " + execResult.toString(), true);
}