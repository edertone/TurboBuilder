#!/usr/bin/env node

'use strict';


/**
 * Methods that help with performing the tests
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
require('./../../main/js/globals');
const { StringUtils, FilesManager, ArrayUtils } = require('turbocommons-ts');
const { execSync } = require('child_process');
const console = require('./../../main/js/console');


let executionDir = path.resolve('./'); 


/**
 * A files manager object ready to be used by the tests
 */
exports.fm = new FilesManager(fs, os, path, process);


/**
 * The path to the turbobuilder executable to test
 */
exports.pathToExecutable = 'node "' + path.resolve(__dirname + '/../../main/js/turbobuilder.js') + '"';


/**
 * Switch the work directory back to the execution dir
 */
exports.switchToExecutionDir = function () {
  
    process.chdir(executionDir);
};


/**
 * Move the work directory to the specified folder inside the main temp folder.
 * If folder does not exist, it will be created
 */
exports.createAndSwitchToTempFolder = function (dirName) {
  
    let tmp = this.fm.createTempDirectory(dirName);
        
    process.chdir(tmp);
    
    return tmp;
};


/**
 * Execute the project via cmd with the specified cmd arguments
 */
exports.exec = function (options) {
    
    try{
        
        return execSync(this.pathToExecutable + ' ' + options, {stdio : 'pipe'}).toString();
        
    }catch(e){
        
        if(!StringUtils.isEmpty(e.stderr.toString())){
            
            return e.stderr.toString();
        }
        
        return e.stdout.toString();
    }  
};


/**
 * Read the setup file from the current work dir and return it as a json object
 */
exports.readSetupFile = function () {
  
    return JSON.parse(this.fm.readFile('.' + this.fm.dirSep() + global.fileNames.setup));
};


/**
 * Save the provided object to the setup file on the current work dir as a json string
 */
exports.saveToSetupFile = function (object) {
  
    return this.fm.saveFile('.' + this.fm.dirSep() + global.fileNames.setup, JSON.stringify(object));
};