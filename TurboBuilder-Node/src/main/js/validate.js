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
    
    validateAllJSONSchemas();
    
    validateProjectStructure();
    
    validateFilesContent();
    
    validateStyleSheets();
    
    validatePackageAndTurboBuilderJsonIntegrity();
    
    validateSitePhp();
    
    validatePhp();
    
    validateJavascript();
    
    // Use angular cli to run the tslint verification for angular projects
	if(global.setup.build.app_angular || global.setup.build.lib_angular){
    
	    console.log("\nLaunching ng lint");
        
	    if(!console.exec('"./node_modules/.bin/ng" lint', '', true)){
	        
	        console.error("validate failed");
	    }	    
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
 * Validates all the possible existing JSON Schemas
 */
let validateAllJSONSchemas = function () {

    validateJSONSchema(global.runtimePaths.root + fm.dirSep() + global.fileNames.setup, 'turbobuilder.schema.json');
    
    if(fm.isFile(global.runtimePaths.root + fm.dirSep() + 'turbousers.json')){
    
        validateJSONSchema(global.runtimePaths.root + fm.dirSep() + 'turbousers.json', 'turbousers.schema.json');
    }
    
    if(global.setup.build.site_php || global.setup.build.server_php ||
       fm.isFile(global.runtimePaths.root + fm.dirSep() + global.fileNames.turboSiteSetup)){
    
        let turbositeSetup = validateJSONSchema(global.runtimePaths.root + fm.dirSep() + global.fileNames.turboSiteSetup, 'turbosite.schema.json');
        
        // Validate the api section of the turbosite.json file
        for (let api of turbositeSetup.api){
        
            // All uri properties inside api must start with api/
            if(api.uri.indexOf('api/') !== 0){
            
                errors.push(`All URIs defined inside the api section on ${global.fileNames.turboSiteSetup} must start with api/ (found: ${api.uri})`);
            }
        }
    }
}


/**
 * Validates a single json schema given its file name and related schema.
 *
 * This method returns the parsed json object representing the read schema.
 */
let validateJSONSchema = function (filePath, schemaFileName) {
    
    let schemasPath = global.installationPaths.mainResources + fm.dirSep() + 'json-schema';
    
    // Validate the received path
    if(!fm.isFile(filePath)){
        
        console.error("Could not find " + StringUtils.getPathElement(filePath) + " at " + filePath);
    }
    
    let fileContent = '';
    
    try{
    
        fileContent = JSON.parse(fm.readFile(filePath));
        
    }catch(e){
        
        console.error("Corrupted JSON for " + StringUtils.getPathElement(filePath) + ":\n" + e.toString());
    }
    
    let schemaContent = JSON.parse(fm.readFile(schemasPath + fm.dirSep() + schemaFileName));
    
    let results = validate(fileContent, schemaContent);
    
    if(!results.valid){
        
        errors.push("Invalid JSON schema for " + StringUtils.getPathElement(filePath) + ":\n" + results.errors[0]);
    }
    
    return fileContent;
}


/**
 * Validates the project structure
 */
let validateProjectStructure = function () {
    
    let sep = fm.dirSep();
    let extrasPath = global.runtimePaths.root + sep + global.folderNames.extras;
    
    // Validate project name is not empty
    if(StringUtils.isEmpty(global.setup.metadata.name)){
    
        console.warning(`No project name defined. Please add it to ${global.fileNames.setup} -> metadata.name`);
    }
    
    // Validate README.md main file is mandatory
    if(global.setup.validate.projectStructure.readmeFileMandatory &&
        !fm.isFile(global.runtimePaths.root + sep + global.fileNames.readme)){
     
         errors.push(global.runtimePaths.root + sep + global.fileNames.readme +
                 " does not exist.\nSet readmeFileMandatory = false to disable this error");
     }
    
    // Validate extras folder is mandatory
    if(global.setup.validate.projectStructure.extrasFolderMandatory && !fm.isDirectory(extrasPath)){
    
        errors.push(extrasPath + " does not exist.\nSet extrasFolderMandatory = false to disable this error");
    }
    
    // Validate all mandatory folders inside the extras folder
    if(global.setup.validate.projectStructure.extrasSubFoldersMandatory){
         
        for (let folder of global.setup.validate.projectStructure.extrasSubFoldersMandatory) {
            
            if(!fm.isDirectory(extrasPath + sep + folder)){
                
                errors.push(extrasPath + sep + folder +
                    " does not exist.\nRemove it from extrasSubFoldersMandatory to disable this error");
            }
        }
    }
    
    // Validate extras/todo folder contains .todo files
    if(global.setup.validate.projectStructure.extrasTodoExtension && fm.isDirectory(extrasPath + sep + 'todo')){
        
        for (let file of fm.getDirectoryList(extrasPath + sep + 'todo')){

            if(StringUtils.getPathExtension(file) !== 'todo'){
                
                errors.push(extrasPath + sep + 'todo' +  sep + file +
                    " must have .todo extension.\nSet extrasTodoExtension = false to disable this error");
            }
        }
    }
    
    // TODO - Validate that all folders inside src/main are the expected.
    
    // TODO - validate the case for all the files and folders
    
    // TODO - validate that gitIgnore file structure is correct
    
    // TODO - Check that no strange files or folders exist
    //validateAllowedFolders([global.runtimePaths.main, global.runtimePaths.test], ["css", "js", "ts", "php", "java", "resources"]);
}


/**
 * Validates the content of the project files
 */
let validateFilesContent = function () {

    let sep = fm.dirSep();

    // Validate that no tabulations exist
    if(global.setup.validate.filesContent.tabsForbidden.enabled){
    
        let excludedStrings = global.setup.validate.filesContent.tabsForbidden.excludes
            .concat([".ico", ".jpg", ".png", ".ttf", ".phar", ".woff"]);
    
        for(let appliesTo of global.setup.validate.filesContent.tabsForbidden.appliesTo){
        
            let projectFolder = global.runtimePaths.root + sep + appliesTo;
        
            if(fm.isDirectory(projectFolder)) {
        
                let files = fm.findDirectoryItems(projectFolder, /^.*\.*$/i, 'absolute', 'files');
                
                for (let file of files){
                    
                    if(!isExcluded(file, excludedStrings) &&
                       file.indexOf(sep + 'main' + sep + 'libs') < 0){
                    
                        let fileContents = fm.readFile(file);
                        
                        if(fileContents.indexOf('\t') >= 0) {
                                
                            errors.push("File contains tabulations: " + file);
                        }
                    }
                }
            }
        }
    }
     
    validateCopyrightHeaders();
}


/**
 * Validates the project css style sheets
 */
let validateStyleSheets = function () {
    
    let sep = fm.dirSep();
    
    // Detect the root view folder based on the current project type
    let viewFolder = (global.setup.build.lib_angular) ?
        global.runtimePaths.root + sep + 'projects' + sep + global.setup.metadata.name + sep + 'src' + sep + 'main' + sep + 'view':
        global.runtimePaths.main + sep + 'view';
    
    if(!fm.isDirectory(viewFolder)){
        
        return;
    }
    
    // Check if only scss files are allowed
    if(global.setup.validate.styleSheets.onlyScss) {
        
        let cssFilesFound = fm.findDirectoryItems(viewFolder, /^.*\.(css)$/i, 'absolute', 'files');
        
        if (cssFilesFound.length > 0){
            
            errors.push("only scss files are allowed: " + cssFilesFound[0]);
        }
    }
    
    // Check forbidden hardcoded colors
    let cssFiles = fm.findDirectoryItems(viewFolder, /^.*\.(css|scss)$/i, 'absolute', 'files');
    
    for (let cssFile of cssFiles){
        
        let cssContents = fm.readFile(cssFile);
        
        if(global.setup.validate.styleSheets.noCssHardcodedColors &&
           /^(?!\$).*:.*(#|rgb).*$/im.test(cssContents)) {
                
            errors.push("File contains hardcoded css color: " + cssFile);
        }
    }
}


/**
 * Validates the copyright headers
 */
let validateCopyrightHeaders = function () {
    
    for (let validator of global.setup.validate.filesContent.copyrightHeaders) {
    
        if(!fm.isFile(global.runtimePaths.root + fm.dirSep() + validator.path)){
        
            console.error("Copyrhight headers template not found:\n" + global.runtimePaths.root + fm.dirSep() + validator.path);
        }
    
        let header = fm.readFile(global.runtimePaths.root + fm.dirSep() + validator.path).replace(/(?:\r\n|\r|\n)/g, "\n");
        
        let filesToValidate = getFilesFromIncludeList(global.runtimePaths.root + fm.dirSep() + validator.appliesTo, validator.includes);
        
        for (let fileToValidate of filesToValidate){
            
            if(!isExcluded(fileToValidate, validator.excludes) && fm.readFile(fileToValidate).replace(/(?:\r\n|\r|\n)/g, "\n").indexOf(header) !== 0){
                
                errors.push("Bad copyright header:\n" + fileToValidate + "\nMust be as defined in " + validator.path + "\n");
            }
        }
    }
}


/**
 * Validates the php code
 */
let validatePhp = function () {
    
    // Auxiliary function to perform namespace validations
    function validate(namespaceToCheck, fileAbsolutePath, mustContainList){
        
        if(mustContainList.length > 0){
            
            let fileRelativePath = fileAbsolutePath.split('src' + fm.dirSep())[1];
            let pathToReplace = StringUtils.replace(fileRelativePath, fm.dirSep() + StringUtils.getPathElement(fileRelativePath), '');
            
            for (let mustContain of mustContainList){
                
                // Replace the wildcards on the mustContain
                mustContain = mustContain.replace('$path', pathToReplace);
                
                if(namespaceToCheck.indexOf(mustContain) < 0){
                    
                    return mustContain;
                }
            }
        }
            
        return '';
    }
    
    if(global.setup.validate.php &&
       global.setup.validate.php.namespaces &&
       global.setup.validate.php.namespaces.enabled){
        
        let filesToValidate = fm.findDirectoryItems(global.runtimePaths.main , /.*\.php$/i, 'absolute', 'files');
        
        for (let fileToValidate of filesToValidate){
            
            if(!isExcluded(fileToValidate, global.setup.validate.php.namespaces.excludes)){
                
                var fileContents = fm.readFile(fileToValidate);
                
                if(fileContents.indexOf("namespace") >= 0){
    
                    var namespace = StringUtils.trim(fileContents.split("namespace")[1].split(";")[0]);
                    
                    var validateNamespace = validate(namespace, fileToValidate, global.setup.validate.php.namespaces.mustContain);
                    
                    if(validateNamespace !== ''){
                    
                        errors.push('Namespace error: "' + namespace + '" Must contain "' + validateNamespace + '" on file:\n' + fileToValidate);
                    }   
                    
                }else{
                    
                    if(global.setup.validate.php.namespaces.mandatory){
                    
                        errors.push("File does not contain a namespace declaration: " + fileToValidate);
                    }           
                }
            }
        }       
    }
    
    // TODO - The php classes must be on files with the same exact name as the php class (this validation should be generic to all php projects not only site php ones)
}


/**
 * Make sure that turbobuilder.json and package.json (if it exists) share the same common property values
 */
let validatePackageAndTurboBuilderJsonIntegrity = function () {
    
    let sep = fm.dirSep();
    let setupPath = global.runtimePaths.root + sep + global.fileNames.setup;
    let packagePath = global.runtimePaths.root + sep + 'package.json';
    
    // Angular library package is located inside projects/library-name
    if(global.setup.build.lib_angular){

        packagePath = global.runtimePaths.root + sep + 'projects' + sep + setupModule.getProjectName() + sep + 'package.json';
    }
    
    // If package.json does not exist we won't vaidate anything
    if(!fm.isFile(packagePath)){
        
        return;
    }
    
    let setup = JSON.parse(fm.readFile(setupPath));
    let packageJson = JSON.parse(fm.readFile(packagePath));
    
    if(setup.metadata.name !== packageJson.name ||
       setup.metadata.description !== packageJson.description){
   
        errors.push("\nName and description must match between the following files:\n" + setupPath + "\n" + packagePath);
    }
}


/**
 * Validates a site php project
 */
let validateSitePhp = function () {

    if(global.setup.build.site_php){
            
        // TODO - echo and print_r commands are not allowed on webservices. If found, a warning will be launched on build and an error on release      
    }
}


/**
 * Validates javascript files
 */
let validateJavascript = function () {

    if(!global.setup.validate.javascript){
    
        return;
    }
    
    let filesToValidate = getFilesFromIncludeList(global.runtimePaths.src, global.setup.validate.javascript.useStrict.includes);
        
    for (let file of filesToValidate){
        
        // Check if js files must contain "use strict" at the very first beginning of the file
        if(global.setup.validate.javascript.useStrict.enabled &&
           !isExcluded(file, global.setup.validate.javascript.useStrict.excludes)) {
          
            let jsContents = fm.readFile(file);
            
            if(jsContents.indexOf('#!/usr/bin/env node') === 0){
            
                if((jsContents.indexOf('use strict') < 0 && jsContents.indexOf("'use strict'") < 0) ||
                   (jsContents.indexOf('use strict') > 24 && jsContents.indexOf("'use strict'") > 24)){
                          
                    errors.push('File must have "use strict" after #!/usr/bin/env node:\n' + file);
                }
                
            }else if(jsContents.indexOf('"use strict"') !== 0 && jsContents.indexOf("'use strict'") !== 0){
                      
                errors.push('File must start with "use strict": ' + file);
            }
        }
    }
}


/**
 * Generates a list of absolute paths for files on the specified folder which full path that matches any of the patterns
 * specified on the includeList parameter.
 */
let getFilesFromIncludeList = function (path, includeList) {

    let includeListProcessed = [];
    
    for (let include of includeList){
    
        includeListProcessed.push(StringUtils.replace(include, '.', '\\.'));
    }

    let regex = new RegExp('^.*(' + includeListProcessed.join('|') + ')$', 'i');
        
    return fm.findDirectoryItems(path, regex, 'absolute', 'files');
}


/**
 * Checks if the specified path contains any of the provided exclude patterns
 */
let isExcluded = function (path, excludeList) {

    for (let exclude of excludeList){
    
        if(StringUtils.formatPath(path, '/').includes(StringUtils.formatPath(exclude, '/'))){

            return true;
        }
    }
    
    return false;
}