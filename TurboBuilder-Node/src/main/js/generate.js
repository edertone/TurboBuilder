'use strict';

/**
 * this module contains all the code related to the generate process
 */


const { FilesManager } = require('turbocommons-ts');
const console = require('./console');
const validateModule = require('./validate');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Create a default setup file on the current folder
 */
let createSetup = function () {
    
    let defaultSetupPath = global.installationPaths.mainResources + fm.dirSep() + global.fileNames.setup;
    
    if (fm.isFile(global.runtimePaths.setupFile)) {
        
        console.error('File ' + global.fileNames.setup + ' already exists');
    }
    
    if (!fm.isFile(defaultSetupPath)) {
        
        console.error(defaultSetupPath + ' file not found');
    }
    
    if(!fm.isDirectoryEmpty(global.runtimePaths.root)){
        
        console.error('Current folder is not empty! :' + global.runtimePaths.root);
    }
        
    if(!fm.copyFile(defaultSetupPath, global.runtimePaths.setupFile)){
        
        console.error('Error creating ' + global.fileNames.setup + ' file');
    }
    
    console.success('Created ' + global.fileNames.setup + ' file');    
}


/**
 * Generate the project folders and files on the current runtime directory
 */
let createProjectStructure = function () {
    
    // Create src folder
    if(!fm.createDirectory(global.runtimePaths.src)){
        
        console.error('Failed creating: ' + global.runtimePaths.src);
    }
    
    // Create main folder
    if(!fm.createDirectory(global.runtimePaths.main)){
    
        console.error('Failed creating: ' + global.runtimePaths.main);
    }
    
    // Create main resources folder
    if(!fm.createDirectory(global.runtimePaths.mainResources)){
        
        console.error('Failed creating: ' + global.runtimePaths.mainResources);
    }
    
    // Create test folder
    if(!fm.createDirectory(global.runtimePaths.test)){
        
        console.error('Failed creating: ' + global.runtimePaths.test);
    }
    
    // Create extras folder
    if(!fm.createDirectory(global.runtimePaths.extras)){
        
        console.error('Failed creating: ' + global.runtimePaths.extras);
    }
    
    console.success('Created all folders ok');
    
    // Create readme file
    if(!fm.copyFile(global.installationPaths.mainResources + fm.dirSep() + global.fileNames.readme,
                    global.runtimePaths.root + fm.dirSep() + global.fileNames.readme)){
        
        console.error('Failed creating: ' + global.runtimePaths.root + fm.dirSep() + global.fileNames.readme);
    }
    
    // Create todo file
    if(!fm.saveFile(global.runtimePaths.extras + fm.dirSep() + global.fileNames.todo,
       'Write all your pending tasks here')){
        
        console.error('Failed creating: ' + global.runtimePaths.extras + fm.dirSep() + global.fileNames.todo);        
    }
    
    console.success('Created all files ok');
}


/**
 * Execute the build process
 */
exports.execute = function () {

    console.log("\generate start");
    
    createSetup();  
    
    createProjectStructure();
    
    console.success('Generated project structure ok');
};

