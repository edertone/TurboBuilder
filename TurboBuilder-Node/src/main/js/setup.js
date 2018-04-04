'use strict';

/**
 * this module contains all the code related to the setup data
 */


const { FilesManager } = require('turbocommons-ts');
const consoleModule = require('./console.js');
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Create a default setup file on the current folder
 */
exports.createSetup = function () {
    
    let defaultSetupPath = global.installationPaths.mainResources + fm.dirSep() + global.fileNames.setup;
    
    if (fm.isFile(global.runtimePaths.setupFile)) {
        
        consoleModule.error('File ' + global.fileNames.setup + ' already exists');
    }
    
    if (!fm.isFile(defaultSetupPath)) {
        
        consoleModule.error(defaultSetupPath + ' file not found');
    }
    
    if(!fm.isDirectoryEmpty(global.runtimePaths.root)){
        
        consoleModule.error('Current folder is not empty! :' + global.runtimePaths.root);
    }
        
    if(!fm.copyFile(defaultSetupPath, global.runtimePaths.setupFile)){
        
        consoleModule.error('Error creating ' + global.fileNames.setup + ' file');
    }
    
    consoleModule.success('Created ' + global.fileNames.setup + ' file');    
}


/**
 * Read the xml setup file and store all the data to a global variable
 */
let loadSetupFromXml = function () {

    if (!fm.isFile(global.runtimePaths.setupFile)) {
    
        consoleModule.error(global.fileNames.setup + ' setup file not found');
    }
    
    //return fm.readFileSync(global.runtimePaths.setupFile, 'utf8');
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

    loadSetupFromXml();
    getLatestGitTag();
}