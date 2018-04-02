'use strict';

/**
 * this module contains all the code related to the setup data
 */


const fs = require('fs');
const consoleModule = require('./console.js');
const { COPYFILE_EXCL } = fs.constants;
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');


/**
 * Create a default setup file on the current folder
 */
exports.createSetup = function () {
    
    let defaultSetupPath = global.installationPaths.mainResources + '/turbobuilder.xml';
    
    if (!fs.existsSync(defaultSetupPath)) {
        
        consoleModule.error(defaultSetupPath + ' file not found', true);
    }
    
    try{
        
        fs.copyFileSync(defaultSetupPath, global.runtimePaths.setupFile, COPYFILE_EXCL);
        
        consoleModule.log('Created ' + global.fileNames.setup + ' file');
        
    }catch(e){
    
        consoleModule.error('Error creating ' + global.fileNames.setup + ' file. Does it already exist?', true);
    }    
}


/**
 * Read the xml setup file and store all the data to a global variable
 */
let loadSetupFromXml = function () {

    if (!fs.existsSync(global.runtimePaths.setupFile)) {
    
        consoleModule.error(global.fileNames.setup + ' setup file not found', true);
    }
    
    return fs.readFileSync(global.runtimePaths.setupFile, 'utf8');
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