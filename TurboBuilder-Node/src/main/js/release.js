'use strict';

/**
 * this module contains all the code related to the release process
 */


const { FilesManager } = require('turbocommons-ts');
const console = require('./console');
const validateModule = require('./validate');
const buildModule = require('./build');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);
let releasePath = global.runtimePaths.target + fm.dirSep() + global.runtimePaths.projectName + "-" + 'MAJOR' + "-" + 'MINOR';    


//We will delete the unpacked src files when application exits, may it be due to a 
//success or an error
process.on('exit', () => {
 
    if(!global.setupBuild.keepUnpackedSrcFiles){
        
        buildModule.removeUnpackedSrcFiles(releasePath);
    }
});


/**
 * Generates the code documentation for the configured languages
 */
let generateCodeDocumentation = function (destPath) {

    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    let docsPath = destPath + sep + 'docs';
    
    // Generate ts doc if ts build is enabled
    if(global.setupBuild.Ts.enabled){
        
        if(!fm.createDirectory(docsPath + sep + 'ts', true)){
           
            console.error('Could not create docs folder ' + docsPath + sep + 'ts');
        }
        
        let typeDocExec = global.installationPaths.typeDocBin;
        
        typeDocExec += ' --name ' + global.runtimePaths.projectName;
        typeDocExec += ' --module commonjs';
        typeDocExec += ' --mode modules';
        typeDocExec += ' --target ES5'; 
        typeDocExec += ' --options "' + destMain + sep + 'ts' + sep + 'tsconfig.json"';
        typeDocExec += ' --out "' + docsPath + sep + 'ts"';
        typeDocExec += ' "' + destMain + sep + 'ts"';
        
        console.exec(typeDocExec, 'ts doc ok');
    }
}


/**
 * Execute the release process
 */
exports.execute = function () {
    
    console.log("\nrelease start");
    
    buildModule.verifyToolsAvailable();
    
    // TODO
    // Read the build number from file, increase it and save it.
    // We will increase it even if the build fails, to prevent overlapping files from different builds.
    // (Note that this file will be auto generated if it does not exist)
    
    buildModule.copyMainFiles(releasePath);
    
    if(global.setupValidate.runBeforeBuild){
        
        validateModule.execute();
    }
    
    if(global.setupBuild.Ts.enabled){
    
        buildModule.buildTypeScript(releasePath);
    }
    
    if(global.setupRelease.generateCodeDocumentation){
        
        generateCodeDocumentation(releasePath);
    }
    
    console.success('release ok');
};