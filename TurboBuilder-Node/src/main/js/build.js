'use strict';

/**
 * this module contains all the code related to the build process
 */


const { FilesManager } = require('turbocommons-ts');
const { execSync } = require('child_process');
const consoleModule = require('./console');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Generate the project folders and files on the current runtime directory
 */
exports.createProjectStructure = function () {
    
    // Create src folder
    if(!fm.createDirectory(global.runtimePaths.src)){
        
        consoleModule.error('Failed creating: ' + global.runtimePaths.src);
    }
    
    // Create main folder
    if(!fm.createDirectory(global.runtimePaths.main)){
    
        consoleModule.error('Failed creating: ' + global.runtimePaths.main);
    }
    
    // Create main resources folder
    if(!fm.createDirectory(global.runtimePaths.mainResources)){
        
        consoleModule.error('Failed creating: ' + global.runtimePaths.mainResources);
    }
    
    // Create test folder
    if(!fm.createDirectory(global.runtimePaths.test)){
        
        consoleModule.error('Failed creating: ' + global.runtimePaths.test);
    }
    
    // Create extras folder
    if(!fm.createDirectory(global.runtimePaths.extras)){
        
        consoleModule.error('Failed creating: ' + global.runtimePaths.extras);
    }
    
    consoleModule.success('Created all folders ok');
    
    // Create readme file
    if(!fm.copyFile(global.installationPaths.mainResources + fm.dirSep() + global.fileNames.readme,
                    global.runtimePaths.root + fm.dirSep() + global.fileNames.readme)){
        
        consoleModule.error('Failed creating: ' + global.runtimePaths.root + fm.dirSep() + global.fileNames.readme);
    }
    
    // Create todo file
    if(!fm.copyFile(global.installationPaths.mainResources + fm.dirSep() + global.fileNames.todo,
                    global.runtimePaths.extras + fm.dirSep() + global.fileNames.todo)){
        
        consoleModule.error('Failed creating: ' + global.runtimePaths.extras + fm.dirSep() + global.fileNames.todo);        
    }
    
    consoleModule.success('Created all files ok');
    
    consoleModule.success('Generated project structure ok');
}


/**
 * Checks that all the required cmd tools are available and can be executed
 */
let verifyToolsAvailable = function () {

	// TODO - check if this is necessary or not, cause we will use node dependencies
    consoleModule.log(execSync(global.installationPaths.typeScriptBin + ' -v', {stdio : 'pipe'}).toString());
    
    consoleModule.log(execSync(global.installationPaths.typeDocBin + ' -v', {stdio : 'pipe'}).toString());
    
    // Check that typescript compiler is available
//    if(global.setupBuild.Ts.enabled){
//        
//        try{
//            
//            execSync('tsc -v', {stdio : 'pipe'});
//            
//        }catch(e){
//
//            consoleModule.error('Could not find Typescript compiler (tsc). Run: npm install -g typescript');
//        }
//    }
}


/**
 * Execute the typescript build process
 */
let buildTypeScript = function () {
    
    let execResult = execSync('tsc', {stdio : 'pipe'});
    
    console.log(execResult.toString());
    
    // TODO
}


/**
 * Execute the build process
 */
exports.execute = function () {
  
    verifyToolsAvailable();
    
    if(global.setupBuild.Ts.enabled){
    
        buildTypeScript();
    }
    
    console.log('build done');
};