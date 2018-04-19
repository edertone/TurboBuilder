'use strict';

/**
 * this module contains all the code related to the setup data
 */


const { FilesManager } = require('turbocommons-ts');
const console = require('./console.js');
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Read the xml setup file and store all the data to a global variable
 */
let loadSetupFromDisk = function () {

    if (!fm.isFile(global.runtimePaths.setupFile)) {
    
        console.error(global.fileNames.setup + ' setup file not found');
    }
    
    global.setup = JSON.parse(fm.readFile(global.runtimePaths.setupFile));
};


/**
 * Get the latest tag if defined on GIT and not specified on TurboBuilder.xml
 */
let getLatestGitTag = function () {
    
    try{
        
        let execResult = execSync('git describe --abbrev=0 --tags', {stdio : 'pipe'});
        
        return StringUtils.trim(execResult.toString());
        
    }catch(e){

        return '0';
    }    
}


/**
 * Initialize the global variables and setup structure from the project xml
 */
exports.init = function () {

    loadSetupFromDisk();
    getLatestGitTag();
}