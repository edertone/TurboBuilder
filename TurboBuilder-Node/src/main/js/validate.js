'use strict';

/**
 * this module contains all the code related to the project validation
 */


const { StringUtils, ObjectUtils, FilesManager } = require('turbocommons-ts');
const path = require('path');
var fs = require('fs');
const console = require('./console.js');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Array that will contain all the warnings detected by this script and will be displayed at the end
 */
let warnings = [];


/**
 * Array that will contain all the errors detected by this script and will be displayed at the end
 */
let errors = [];


/**
 * Auxiliary method to validate that only the allowed contents exist on the specified folders
 */
let validateAllowedFolders = function (foldersToInspect, allowedContents){
    
    for(let i = 0; i < foldersToInspect.length; i++){
        
        var inspectedList = getFoldersList(foldersToInspect[i]);
        
        for(let j = 0; j < inspectedList.length; j++){
            
            if(!inArray(inspectedList[j], allowedContents)){
                    
                errors.push(inspectedList[j] + " is not allowed inside " + foldersToInspect[i]);
            }                       
        }
    }
}


/**
 * Validates the project structure
 */
let validateProjectStructure = function () {
    
    if(!global.setup.validate.projectStructure.enabled){
    
        return;
    }
    
    // Check that all the project mandatory folders and files exist
//    for (let key of ObjectUtils.getKeys(global.runtimePaths)) {
//        
//        // Ignore files that are not mandatory or disabled via setup
//        if(key === 'target' ||
//           (key === 'extras' && !global.setupValidate.ProjectStructure.forceExtrasFolder) ||
//           (key === 'readmeFile' && !global.setupValidate.ProjectStructure.forceReadmeFile) ||
//           (key === 'todoFile' && !global.setupValidate.ProjectStructure.forceTODOFile)){
//            
//            continue;
//        }
//        
//        if (!fs.existsSync(global.runtimePaths[key])) {
//            
//            errors.push(global.runtimePaths[key] + " does not exist");
//        }
//    }
    
    // Check that no strange files or folders exist
    //validateAllowedFolders([global.runtimePaths.main, global.runtimePaths.test], ["css", "js", "ts", "php", "java", "resources"]);
    
    // Validate that gitIgnore file is correct
    if(global.setup.validate.projectStructure.checkGitIgnore === true){
        
        // TODO - validate git ignore    
    }   
}


/**
 * Validates the copyright headers
 */
let validateCopyrightHeaders = function () {
    
    for (let validator of global.setup.validate.copyrightHeaders) {
        
        if(validator.enabled){
            
            let header = fm.readFile(global.runtimePaths.root + fm.dirSep() + validator.path).replace(/(?:\r\n|\r|\n)/g, "\n");
            
            let regex = new RegExp('^.*(' + validator.includes.join('|') + ')$', 'i');
            
            let filesToValidate = fm.findDirectoryItems(global.runtimePaths.root + fm.dirSep() + validator.appliesTo, regex, 'absolute', 'files');
            
            for (let fileToValidate of filesToValidate){
                
                let found = false;
                
                for(let excluded of validator.excludes){
                   
                    if(fileToValidate.indexOf(excluded) >= 0){
                        
                        found = true;
                    }
                }
                
                if(!found && fm.readFile(fileToValidate).replace(/(?:\r\n|\r|\n)/g, "\n").indexOf(header) !== 0){
                    
                    errors.push("Bad copyright header:\n" + fileToValidate + "\nMust be as defined in " + validator.path + "\n");
                }
            }
        }
    }
}


/**
 * Perform all the validation tasks
 */
exports.execute = function () {
    
    console.log("\nvalidate start");
    
    validateProjectStructure();
    
    validateCopyrightHeaders();
     
    console.errors(errors);
    
    // Reaching here means validation was successful
    console.success("validate ok");
}