#!/usr/bin/env node

'use strict';


/**
 * Methods that help with performing the tests
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { FilesManager } = require('turbocommons-ts');
const { execSync } = require('child_process');
const consoleModule = require('./../../main/js/console.js');


let fm = new FilesManager(fs, os, path, process);
let tempFolder = fm.createTempDirectory('turbobuilder-tests');
let pathToExecutable = 'node "' + path.resolve(__dirname + '/../../main/js/turbobuilder.js') + '"';


/**
 * Move the word directory to the specified folder inside the main temp root.
 * If folder does not exist, it will be created
 */
exports.switchToDirInsideTemp = function (dirName) {
  
    const workDir = tempFolder + fm.getDirectorySeparator() + dirName;

    fm.createDirectory(workDir);
    
    process.chdir(workDir);
};


/**
 * Execute the project via cmd with the specified options
 */
exports.exec = function (options) {
  
    execSync(pathToExecutable + ' ' + options, {stdio : 'pipe'});
};


/**
 * Verify that executing a project cmd execution contains the expected results
 */
exports.assertExecContains = function (options, expected, errorMessage) {
  
    let execResult = execSync(pathToExecutable + ' ' + options, {stdio : 'pipe'});

    if(execResult.toString().indexOf(expected) < 0){

        consoleModule.error(errorMessage + "\n" + execResult.toString(), true);
    }
};