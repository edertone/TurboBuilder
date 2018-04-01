'use strict';

/**
 * this module contains all the code related to the build process
 */


const { execSync } = require('child_process');


/**
 * Generate the project folders and files on the current runtime directory
 */
exports.createProjectStructure = function () {
    
    // TODO
}


/**
 * Checks that all the required cmd tools are available and can be executed
 */
let verifyToolsAvailable = function () {

    // Check that typescript compiler is available
    if(global.setupBuild.Ts.enabled){
        
        try{
            
            execSync('tsc -v', {stdio : 'pipe'});
            
        }catch(e){

            console.log('Could not find Typescript compiler (tsc). Run: npm install -g typescript');
            process.exit(1);
        }
    }
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