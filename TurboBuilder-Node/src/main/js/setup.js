'use strict';

/**
 * this module contains all the code related to the setup data
 */


const { FilesManager } = require('turbocommons-ts');
const console = require('./console.js');
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


let isGitAvailable = false;


/**
 * Check if the git cmd executable is available or not no the system
 */
exports.checkGitAvailable = function () {

    if(!isGitAvailable){
        
        try{
            
            execSync('git --version', {stdio : 'pipe'});
            
            isGitAvailable = true;
            
        }catch(e){

            console.error('Could not find Git cmd executable. Please install git on your system to create git changelogs');
        }
    }
}


/**
 * Calculate the most recent project semantic version value (major.minor.patch) depending on git tags or other parameters
 */
exports.getCurrentSemVer = function () {
    
    this.checkGitAvailable();
    
    try{
        
        let execResult = execSync('git describe --abbrev=0 --tags', {stdio : 'pipe'});
        
        return StringUtils.trim(execResult.toString());
        
    }catch(e){

        return '0.0.0';
    }    
}


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
 * Initialize the global variables and setup structure from the project xml
 */
exports.init = function () {

    loadSetupFromDisk();
}