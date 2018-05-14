'use strict';

/**
 * this module contains all the code related to the setup data
 */


const { FilesManager, ObjectUtils } = require('turbocommons-ts');
const console = require('./console.js');
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');
const validateModule = require('./validate');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


let isWinSCPAvailable = false;

let isGitAvailable = false;

let isPhpAvailable = false;


/**
 * Initialize the global variables and setup structure from the project xml
 */
exports.init = function () {
    
    loadSetupFromDisk();

    validateModule.validateBuilderVersion();
}


/**
 * Check if the WinSCP cmd executable is available or not on the system
 */
exports.checkWinSCPAvailable = function () {

    if(!isWinSCPAvailable){
        
        try{
            
            execSync('winscp /help', {stdio : 'pipe'});
            
            isWinSCPAvailable = true;
            
        }catch(e){

            console.error('Could not find winscp cmd executable. Please install winscp and make sure is available globally via cmd (add to PATH enviroment variable) to perform sync operations');
        }
    }
}


/**
 * Check if the git cmd executable is available or not on the system
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
 * Check if the php cmd executable is available or not on the system
 */
exports.checkPhpAvailable = function () {

    if(!isPhpAvailable){
        
        try{
            
            execSync('php -v', {stdio : 'pipe'});
            
            isPhpAvailable = true;
            
        }catch(e){

            console.error('Could not find Php cmd executable. Please install php and make sure is available globally via cmd (add to enviroment variables).');
        }
    }
}


/**
 * Calculate the turbo builder cmd current version
 */
exports.getBuilderVersion = function () {
    
    return StringUtils.trim(require(global.installationPaths.root + '/package.json').version);
}


/**
 * Calculate the most recent project semantic version value (major.minor.patch) depending on git tags or other parameters
 */
exports.getProjectRepoSemVer = function () {
    
    this.checkGitAvailable();
    
    try{
        
        let execResult = execSync('git describe --abbrev=0 --tags', {stdio : 'pipe'});
        
        return StringUtils.trim(execResult.toString());
        
    }catch(e){

        return '0.0.0';
    }    
}


/**
 * Count the number of commits since the most recent git tag
 */
exports.countCommitsSinceLatestTag = function () {
    
    this.checkGitAvailable();
    
    try{
        
        let execResult = execSync('git describe --abbrev=0 --tags', {stdio : 'pipe'});
        
        execResult = execSync('git rev-list ' + StringUtils.trim(execResult.toString()) + '.. --count', {stdio : 'pipe'});
        
        return StringUtils.trim(execResult.toString());
        
    }catch(e){

        return '0';
    }    
}


/**
 * Read the xml setup file and store all the data to a global variable
 */
let loadSetupFromDisk = function () {

    if (!fm.isFile(global.runtimePaths.setupFile)) {
    
        console.error(global.fileNames.setup + ' setup file not found');
    }
    
    let templateSetupPath = global.installationPaths.mainResources + fm.dirSep() + 'project-templates' + fm.dirSep() + 'shared' + fm.dirSep() + global.fileNames.setup;
    
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
        
        // Sync setup on tempalte is just informative, so if not specified on project
        // setup, it will be removed
        if(key === 'sync' &&
           !projectSetup.hasOwnProperty(key)){
            
            delete templateSetup[key];
        }
        
        // Build project types are deleted from the default template, cause there can only be one
        // defined
        if(global.setupBuildTypes.indexOf(key) >= 0 &&
           !projectSetup.hasOwnProperty(key)){
            
            delete templateSetup[key];
        }
        
        if(projectSetup.hasOwnProperty(key)){
            
            if(ObjectUtils.isObject(templateSetup[key])){
                
                mergeSetup(templateSetup[key], projectSetup[key]);
            
            }else{
                
                templateSetup[key] = projectSetup[key];
            }
        }
    }
};