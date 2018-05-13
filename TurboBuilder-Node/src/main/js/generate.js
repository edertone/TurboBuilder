'use strict';

/**
 * this module contains all the code related to the generate process
 */


const { FilesManager, StringUtils } = require('turbocommons-ts');
const console = require('./console');
const validateModule = require('./validate');
const setupModule = require('./setup');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Execute the build process
 */
exports.execute = function () {

    console.log("\generate start");
    
    createSetup();  
    
    createProjectStructure();
    
    console.success('Generated project structure ok');
};


/**
 * Create a default setup file on the current folder
 */
let createSetup = function () {
    
    let templateSetupPath = global.installationPaths.mainResources + fm.dirSep() + 'project-template' + fm.dirSep() + global.fileNames.setup;
    
    if (fm.isFile(global.runtimePaths.setupFile)) {
        
        console.error('File ' + global.fileNames.setup + ' already exists');
    }
    
    if (!fm.isFile(templateSetupPath)) {
        
        console.error(templateSetupPath + ' file not found');
    }
    
    if(!fm.isDirectoryEmpty(global.runtimePaths.root)){
        
        console.error('Current folder is not empty! :' + global.runtimePaths.root);
    }
    
    // Read the setup file, replace the expected builder version with the current one and save it
    let setupContents = fm.readFile(templateSetupPath);
    
    setupContents = StringUtils.replace(setupContents, '"builderVersion": ""', '"builderVersion": "' + setupModule.getBuilderVersion() + '"');
        
    if(!fm.saveFile(global.runtimePaths.setupFile, setupContents)){
        
        console.error('Error creating ' + global.fileNames.setup + ' file');
    }
    
    console.success('Created ' + global.fileNames.setup + ' file');    
}


/**
 * Generate the project folders and files on the current runtime directory
 */
let createProjectStructure = function () {
    
    let sep = fm.dirSep();
    
    // Create js, ts, php, java folders
    if(!fm.createDirectory(global.runtimePaths.main + sep + 'js', true) ||
       !fm.createDirectory(global.runtimePaths.main + sep + 'ts', true) ||
       !fm.createDirectory(global.runtimePaths.main + sep + 'php', true) ||
       !fm.createDirectory(global.runtimePaths.main + sep + 'java', true) ||
       !fm.createDirectory(global.runtimePaths.mainResources, true)){
    
        console.error('Failed creating js, ts, php, java, resources folders inside: ' + global.runtimePaths.main);
    }
    
    // Create test folder
    if(!fm.createDirectory(global.runtimePaths.test)){
        
        console.error('Failed creating: ' + global.runtimePaths.test);
    }
    
    // Copy the extras folder from template
    if(!fm.createDirectory(global.runtimePaths.extras) ||
       !fm.copyDirectory(global.installationPaths.mainResources + sep + 'project-template' + sep + 'extras', global.runtimePaths.extras)){
        
        console.error('Failed creating: ' + global.runtimePaths.extras);
    }
    
    console.success('Created all folders ok');
    
    // Create readme file
    if(!fm.copyFile(global.installationPaths.mainResources + sep + 'project-template' + sep + global.fileNames.readme,
                    global.runtimePaths.root + sep + global.fileNames.readme)){
        
        console.error('Failed creating: ' + global.runtimePaths.root + sep + global.fileNames.readme);
    }
    
    console.success('Created all files ok');
}