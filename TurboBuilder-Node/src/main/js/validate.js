'use strict';

/**
 * this module contains all the code related to the project validation
 */


const { StringUtils, ObjectUtils, FilesManager } = require('turbocommons-ts');
const path = require('path');
var fs = require('fs');
const setupModule = require('./setup');
const console = require('./console.js');
let validate = require('jsonschema').validate;


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
 * Perform all the validation tasks
 */
exports.execute = function (verbose = true) {
    
    if(verbose){
    
        console.log("\nvalidate start");
    }
    
    validateJSONSchema(global.runtimePaths.root + fm.dirSep() + global.fileNames.setup, 'turbobuilder.schema.json');
    
    validateProjectStructure();
    
    validateCopyrightHeaders();
     
    validateNamespaces();
    
    // Validate site php if this is the project type
    if(global.setup.build.site_php){
        
        validateSitePhp();
    }
    
    console.errors(errors);
    
    // Reaching here means validation was successful
    console.success("validate ok");
}


/**
 * Check the current builder version and the one specified on setup json and if they are different, launch a warning
 */
exports.validateBuilderVersion = function () {
    
    let expectedVersion = StringUtils.trim(global.setup.metadata.builderVersion);
    
    if(StringUtils.isEmpty(expectedVersion)){
        
        console.error("metadata.builderVersion not specified on " + global.fileNames.setup);
    }
    
    if(expectedVersion !== setupModule.getBuilderVersion()){
    
        console.warning("Warning: Current turbobuilder version (" + setupModule.getBuilderVersion() + ") does not match expected (" + expectedVersion + ")");
    }
}


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
 * Validates all the affected JSON Schemas
 */
let validateJSONSchema = function (filePath, schemaFileName) {
    
    let schemasPath = global.installationPaths.mainResources + fm.dirSep() + 'json-schema';
    
    // Validate the received path
    if(!fm.isFile(filePath)){
        
        console.error("Could not find " + StringUtils.getPathElement(filePath) + " at " + filePath);
    }
    
    let fileContent = JSON.parse(fm.readFile(filePath));
    let schemaContent = JSON.parse(fm.readFile(schemasPath + fm.dirSep() + schemaFileName));
    
    let results = validate(fileContent, schemaContent);
    
    if(!results.valid){
        
        errors.push("Invalid JSON schema for " + StringUtils.getPathElement(filePath) + ":\n" + results.errors[0]);
    }
}


/**
 * Validates the project structure
 */
let validateProjectStructure = function () {
    
    if(!global.setup.validate.projectStructure.enabled){
    
        return;
    }
    
    // Todo - get project structure from template and check it on runtime folder
    
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
    
        let header = fm.readFile(global.runtimePaths.root + fm.dirSep() + validator.path).replace(/(?:\r\n|\r|\n)/g, "\n");
        
        let regex = new RegExp('^.*(' + validator.includes.join('|') + ')$', 'i');
        
        let filesToValidate = fm.findDirectoryItems(global.runtimePaths.root + fm.dirSep() + validator.appliesTo, regex, 'absolute', 'files');
        
        for (let fileToValidate of filesToValidate){
            
            let fileIsExcluded = false;
            
            for(let excluded of validator.excludes){
               
                if(fileToValidate.indexOf(excluded) >= 0){
                    
                    fileIsExcluded = true;
                }
            }
            
            if(!fileIsExcluded && fm.readFile(fileToValidate).replace(/(?:\r\n|\r|\n)/g, "\n").indexOf(header) !== 0){
                
                errors.push("Bad copyright header:\n" + fileToValidate + "\nMust be as defined in " + validator.path + "\n");
            }
        }
    }
}


/**
 * Validates the Name spaces
 */
let validateNamespaces = function () {
    
    // Auxiliary function to perform namespace validations
    function validate(namespaceToCheck, fileAbsolutePath, mustContainList){
        
        if(mustContainList.length > 0){
            
            let fileRelativePath = fileAbsolutePath.split('src' + fm.dirSep())[1];
            let pathToReplace = StringUtils.replace(fileRelativePath, fm.dirSep() + StringUtils.getPathElement(fileRelativePath), '');
            
            for (let mustContain of mustContainList){
                
                // Replace the wildcards on the mustContain
                mustContain = mustContain.replace('$path', pathToReplace);
                
                for(var i = 0; i < StringUtils.countPathElements(fileAbsolutePath); i++){
                    
                    mustContain = mustContain.replace('$' + String(i), StringUtils.getPathElement(fileAbsolutePath, i));
                }
                
                if(namespaceToCheck.indexOf(mustContain) < 0){
                    
                    return mustContain;
                }
            }
        }
            
        return '';
    }
    
    if(global.setup.validate.phpNamespaces.enabled){
        
        let filesToValidate = fm.findDirectoryItems(global.runtimePaths.main + fm.dirSep() + 'php', /.*\.php$/i, 'absolute', 'files');
        
        for (let fileToValidate of filesToValidate){
            
            let fileIsExcluded = false;
            
            for(let excluded of global.setup.validate.phpNamespaces.excludes){
               
                if(fileToValidate.indexOf(excluded) >= 0){
                    
                    fileIsExcluded = true;
                }
            }
            
            if(!fileIsExcluded){
                
                var fileContents = fm.readFile(fileToValidate);
                
                if(fileContents.indexOf("namespace") >= 0){
    
                    var namespace = StringUtils.trim(fileContents.split("namespace")[1].split(";")[0]);
                    
                    var validateNamespace = validate(namespace, fileToValidate, global.setup.validate.phpNamespaces.mustContain);
                    
                    if(validateNamespace !== ''){
                    
                        errors.push('Namespace error: "' + namespace + '" Must contain "' + validateNamespace + '" on file:\n' + fileToValidate);
                    }   
                    
                }else{
                    
                    if(global.setup.validate.phpNamespaces.mandatory){
                    
                        errors.push("File does not contain a namespace declaration: " + fileToValidate);
                    }           
                }
            }
        }       
    }
}


/**
 * Validates a site php project
 */
let validateSitePhp = function () {

    // Validate the turbosite.json schema
    validateJSONSchema(global.runtimePaths.root + fm.dirSep() + global.fileNames.turboSiteSetup, 'turbosite.schema.json');
    
    // Validate css files
    let cssFiles = fm.findDirectoryItems(global.runtimePaths.main + fm.dirSep() + 'view', /^.*\.(css|scss)$/i, 'absolute', 'files');
    
    for (let cssFile of cssFiles){
        
        let cssContents = fm.readFile(cssFile);
        
        // Check if css hardcoded colors are forbidden
        if(global.setup.validate.sitePhp.cssHardcodedColors &&
           /^(?!\$).*:.*(#|rgb).*$/im.test(cssContents)) {
                
            errors.push("File contains hardcoded css color: " + cssFile);
        }
    }
}