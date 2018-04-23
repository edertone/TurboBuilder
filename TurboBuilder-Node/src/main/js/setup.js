'use strict';

/**
 * this module contains all the code related to the setup data
 */


const { FilesManager, ObjectUtils } = require('turbocommons-ts');
const console = require('./console.js');
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


let isGitAvailable = false;


/**
 * Get the turbobuilder cmd tool and project versions ready to print to console
 */
exports.getVersionNumbers = function () {

    let result = "\nturbobuilder: " + require(global.installationPaths.root + '/package.json').version;
    
    if (fm.isFile(global.runtimePaths.setupFile)) {
    
        result += "\n\n" + global.runtimePaths.projectName + ': ' + this.getCurrentSemVer();
    }
    
    return result;
}


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
    
    let templateSetupPath = global.installationPaths.mainResources + fm.dirSep() + 'project-template' + fm.dirSep() + global.fileNames.setup;
    
    // Load the template setup
    global.setup = JSON.parse(fm.readFile(templateSetupPath));
    
    // Merge the project setup into the template one
    mergeSetup(global.setup, JSON.parse(fm.readFile(global.runtimePaths.setupFile)));
};


/**
 * Merge the project custom setup with the template default one
 */
let mergeSetup = function (templateSetup, projectSetup) {
    
    for (let key of ObjectUtils.getKeys(templateSetup)){
        
        if(projectSetup.hasOwnProperty(key)){
            
            if(ObjectUtils.isObject(templateSetup[key])){
                
                mergeSetup(templateSetup[key], projectSetup[key]);
            
            }else{
                
                templateSetup[key] = projectSetup[key];
            }
        }
    }
};


/**
 * Initialize the global variables and setup structure from the project xml
 */
exports.init = function () {

    loadSetupFromDisk();
}