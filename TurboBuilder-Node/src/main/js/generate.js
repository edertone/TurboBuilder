'use strict';

/**
 * this module contains all the code related to the generate process
 */


const { FilesManager, StringUtils, ObjectUtils } = require('turbocommons-ts');
const console = require('./console');
const validateModule = require('./validate');
const setupModule = require('./setup');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Execute the generate process
 */
exports.execute = function (type) {

    validate(type);
    
    console.log("\ngenerate " + type + " start");
    
    createProjectStructure(type);
    
    createSetupFile(type);
    
    console.success('Generated project structure ok');
};


/**
 * Check if project structure can be created
 */
let validate = function (type) {

    if(global.setupBuildTypes.indexOf(type) < 0){
        
        console.error("invalid project type");
    }
    
    let templateSetupPath = global.installationPaths.mainResources + fm.dirSep() + 'project-templates' + fm.dirSep() + 'shared' + fm.dirSep() + global.fileNames.setup;
    
    if (fm.isFile(global.runtimePaths.setupFile)) {
        
        console.error('File ' + global.fileNames.setup + ' already exists');
    }
    
    if (!fm.isFile(templateSetupPath)) {
        
        console.error(templateSetupPath + ' file not found');
    }
    
    if(!fm.isDirectoryEmpty(global.runtimePaths.root)){
        
        console.error('Current folder is not empty! :' + global.runtimePaths.root);
    }
}


/**
 * Customize the default setup file to the project type
 */
let createSetupFile = function (type) {
    
    let templateSetupPath = global.installationPaths.mainResources + fm.dirSep() + 'project-templates' + fm.dirSep() + 'shared' + fm.dirSep() + global.fileNames.setup;
    
    // Read the default template setup file
    let setupContents = JSON.parse(fm.readFile(templateSetupPath));
    
    // Replace the expected builder version with the current one and save it
    setupContents.metadata.builderVersion = setupModule.getBuilderVersion();
    
    // Customize the setup data to the project type
    if(type === 'lib_php'){
        
        for (let key of ObjectUtils.getKeys(setupContents.build)) {
            
            if(key !== type){
                
                delete setupContents.build[key]; 
            }
        }
        
        for (let key of ObjectUtils.getKeys(setupContents.test)) {
            
            if(key !== 'php'){
                
                delete setupContents.test[key]; 
            }
        }
    }
    
    if(!fm.saveFile(global.runtimePaths.setupFile, JSON.stringify(setupContents, null, 4))){
        
        console.error('Error creating ' + global.fileNames.setup + ' file');
    }
    
    console.success('Created ' + global.fileNames.setup + ' file');    
}


/**
 * Generate the project folders and files on the current runtime directory
 */
let createProjectStructure = function (type) {
    
    let sep = fm.dirSep();
    let templatesFolder = global.installationPaths.mainResources + sep + 'project-templates';
    
    // Copy the project type specific files
    fm.copyDirectory(templatesFolder + sep + type, global.runtimePaths.root);
    
    // Copy the extras folder
    if(!fm.createDirectory(global.runtimePaths.extras) ||
       !fm.copyDirectory(templatesFolder + sep + 'shared' + sep + 'extras', global.runtimePaths.extras)){
    
        console.error('Failed creating: ' + global.runtimePaths.extras);
    }
    
    // Create readme file
    if(!fm.copyFile(templatesFolder + sep + 'shared' + sep + global.fileNames.readme,
       global.runtimePaths.root + sep + global.fileNames.readme)){
        
        console.error('Failed creating: ' + global.runtimePaths.root + sep + global.fileNames.readme);
    }
    
    // Copy the gitignore file
    if(!fm.copyFile(templatesFolder + sep + 'shared' + sep + 'gitignore.txt',
        global.runtimePaths.root + sep + global.fileNames.gitignore)){
         
        console.error('Failed creating: ' + global.runtimePaths.root + sep + global.fileNames.gitignore);
    }
    
    console.success('Generated ' + type + ' structure');
}