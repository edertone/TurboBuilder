'use strict';

/**
 * this module contains all the code related to the setup data
 */


var fs = require('fs');
const { COPYFILE_EXCL } = fs.constants;
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');


/**
 * Create a default setup file on the current folder
 */
exports.createSetup = function () {
    
    let defaultSetupPath = global.MAIN_RESOURCES_PATH + '/default-setup.xml';
    
    if (!fs.existsSync(defaultSetupPath)) {
        
        console.log(defaultSetupPath + ' file not found');
        
        process.exit(1);
    }
    
    try{
        
        fs.copyFileSync(defaultSetupPath, global.RUNTIME_PATH + global.SETUP_FILE_NAME, COPYFILE_EXCL);
        
        console.log('Created ' + global.SETUP_FILE_NAME + ' file');
        
    }catch(e){
    
        console.log('Error creating ' + global.SETUP_FILE_NAME + ' file. Does it already exist?');
        
        process.exit(1);
    }    
}


/**
 * Checks that all the required cmd tools are available and can be executed
 */
let verifyToolsAvailable = function () {

    // TODO
}


/**
 * Read the xml setup file and store all the data to a global variable
 */
let loadSetupFromXml = function () {

    verifyToolsAvailable();
    
    if (!fs.existsSync(global.RUNTIME_PATH + global.SETUP_FILE_NAME)) {
    
        console.log(global.SETUP_FILE_NAME + ' setup file not found');
        
        // Terminate application with error code
        process.exit(1);
    }
    
    return fs.readFileSync(global.RUNTIME_PATH + global.SETUP_FILE_NAME, 'utf8');
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