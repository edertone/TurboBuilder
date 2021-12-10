'use strict';

/**
 * this module contains all the code related to the project validation
 */


const { StringUtils, ArrayUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const setupModule = require('./setup');
const { ConsoleManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');
const validate = require('jsonschema').validate;
const jsonDuplicateValidator = require('json-dup-key-validator');


let fm = new FilesManager();
const cm = new ConsoleManager();
const terminalManager = new TerminalManager();


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
    
        cm.text("\nvalidate start");
    }
    
    validateAllJSONSchemas();
    
    validateProjectStructure();
    
    validateFilesContent();
    
    validateStyleSheets();
    
    validatePackageAndTurboBuilderJsonIntegrity();
    
    validateSitePhp();
    
    validatePhp();
    
    validateJavascript();
    
    validateAngularApp();
    
    cm.errors(errors);
    cm.warnings(warnings);
    
    // Reaching here means validation was successful
    cm.success("validate ok");
}


/**
 * Check the current builder version and the one specified on setup json and if they are different, launch a warning
 */
exports.validateBuilderVersion = function () {
    
    let expectedVersion = StringUtils.trim(global.setup.metadata.builderVersion);
    
    if(StringUtils.isEmpty(expectedVersion)){
        
        cm.error("metadata.builderVersion not specified on " + global.fileNames.setup);
    }
    
    if(expectedVersion !== setupModule.getBuilderVersion()){
    
        cm.warning("Warning: Current turbobuilder version (" + setupModule.getBuilderVersion() + ") does not match expected (" + expectedVersion + ")");
    }
}


/**
 * Validates all the possible existing JSON Schemas
 */
let validateAllJSONSchemas = function () {
    
    let turbobuilderSetupPath = global.runtimePaths.root + fm.dirSep() + global.fileNames.setup;
    let turbodepotSetupPath = global.runtimePaths.root + fm.dirSep() + 'turbodepot.json';
    let turbositeSetupPath = global.runtimePaths.root + fm.dirSep() + global.fileNames.turboSiteSetup;

    // Validate the turbobuilder.json file and its release extension if it exists
    validateJSONSchema(validateJSONContents(turbobuilderSetupPath), 'turbobuilder.json', 'turbobuilder.schema.json');

    if(setupModule.isReleaseSetupPresent(global.fileNames.setup)){
        
        validateJSONContents(setupModule.getReleaseSetupFilePath(global.fileNames.setup));
        validateJSONSchema(setupModule.loadSetupFromDisk(global.fileNames.setup, true), 'turbobuilder.release.json', 'turbobuilder.schema.json');    
    }    
    
    // Validate the turbodepot.json file and its release extension if it exists
    if(fm.isFile(turbodepotSetupPath)){
    
        validateJSONSchema(validateJSONContents(turbodepotSetupPath), 'turbodepot.json', 'turbodepot.schema.json');
        
        if(setupModule.isReleaseSetupPresent('turbodepot.json')){
            
            validateJSONContents(setupModule.getReleaseSetupFilePath('turbodepot.json'));
            validateJSONSchema(setupModule.loadSetupFromDisk('turbodepot.json', true), 'turbodepot.release.json', 'turbodepot.schema.json');    
        } 
    }
    
    // Validate the turbosite.json file and its release extension if it exists
    if(global.setup.build.site_php || global.setup.build.server_php ||
       fm.isFile(turbositeSetupPath)){
    
        let turbositeSetup = validateJSONSchema(validateJSONContents(turbositeSetupPath), 'turbosite.json', 'turbosite.schema.json');
        
        // Validate the api section of the turbosite.json file
        for (let api of turbositeSetup.webServices.api){
        
            // All uri properties inside api must start with api/
            if(api.uri.indexOf('api/') !== 0){
            
                errors.push(`All URIs defined inside the api section on ${global.fileNames.turboSiteSetup} must start with api/ (found: ${api.uri})`);
            }
        }
        
        if(setupModule.isReleaseSetupPresent('turbosite.json')){
            
            validateJSONContents(setupModule.getReleaseSetupFilePath('turbosite.json'));
            validateJSONSchema(setupModule.loadSetupFromDisk('turbosite.json', true), 'turbosite.release.json', 'turbosite.schema.json');    
        } 
    }
}


/**
 * Validates that the provided json file contains valid json code
 *
 * returns the parsed json object
 */
let validateJSONContents = function (filePath) {
    
    // Validate the received path exists
    if(!fm.isFile(filePath)){
        
        cm.error("Could not find " + StringUtils.getPathElement(filePath) + " at " + filePath);
    }
    
    // Check the JSON file is readable and parseable
    let fileJsonAsObject = null;
    let fileContents = fm.readFile(filePath);
    
    try{
        
        fileJsonAsObject = JSON.parse(fileContents);
        
    }catch(e){
        
        cm.error("Corrupted JSON for " + StringUtils.getPathElement(filePath) + ":\n" + e.toString());
    }
    
    // Validate that the json file does not have duplicate keys
    let jsonDupKeysResult = jsonDuplicateValidator.validate(fileContents, false);
    
    if(jsonDupKeysResult !== undefined){
        
        cm.error("Duplicate keys found on JSON for " + StringUtils.getPathElement(filePath) + ":\n" + jsonDupKeysResult);
    }
    
    return fileJsonAsObject;
}


/**
 * Validates a single json schema given a parsed json file and the related schema.
 *
 * Returns the parsed json object
 */
let validateJSONSchema = function (jsonAsObject, jsonFileName, schemaFileName) {
    
    // Validate that the JSON matches the respective schema
    let schemasPath = global.installationPaths.mainResources + fm.dirSep() + 'json-schema';
    let schemaContent = JSON.parse(fm.readFile(schemasPath + fm.dirSep() + schemaFileName));
    
    let results = validate(jsonAsObject, schemaContent);
    
    if(!results.valid){
        
        errors.push("Invalid JSON schema for " + jsonFileName + ":\n" + results.errors[0]);
    }
    
    return jsonAsObject;
}


/**
 * Validates the project structure
 */
let validateProjectStructure = function () {
    
    let sep = fm.dirSep();
    let extrasPath = global.runtimePaths.root + sep + global.folderNames.extras;
    
    // Validate project name is not empty
    if(StringUtils.isEmpty(global.setup.metadata.name)){
    
        cm.warning(`No project name defined. Please add it to ${global.fileNames.setup} -> metadata.name`);
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
    
    // Strictly validate folders inside src
    if(global.setup.validate.projectStructure.strictSrcFolders.enabled){
        
        // Validate libs and resources folders inside src are only allowed at the root of src/main and src/test
        let folders = fm.findDirectoryItems(global.runtimePaths.src, /libs/i, 'relative', 'folders');
        
        folders = folders.concat(fm.findDirectoryItems(global.runtimePaths.src, /resources/i, 'relative', 'folders'));

        for (let folder of folders){

            if(!isFileOnExcludeList(folder, global.setup.validate.projectStructure.strictSrcFolders.excludes) &&
               StringUtils.getPath(folder, 1, '/') !== 'main' &&
               StringUtils.getPath(folder, 1, '/') !== 'test'){
                
                errors.push(folder +
                    " folder is only allowed at src/main and src/test");
            }
        }
    }
    
    // Validate the case for all the configured file extensions
    if(global.setup.validate.projectStructure.strictFileExtensionCase){
        
        for (let affectedPath of global.setup.validate.projectStructure.strictFileExtensionCase.affectedPaths) {
        
            // Note that we are here excluding target and node_modules folders from the search to improve performance
            let filesToValidate = fm.findDirectoryItems(global.runtimePaths.root + fm.dirSep() + affectedPath, /.*/,
                'absolute', 'files', -1, /target(\/|\\)|node_modules(\/|\\)/);
            
            for (let fileToValidate of filesToValidate){
                
                if(!isFileOnExcludeList(fileToValidate, global.setup.validate.projectStructure.strictFileExtensionCase.excludes) &&
                   StringUtils.getPathExtension(fileToValidate).toLowerCase() !== StringUtils.getPathExtension(fileToValidate)){
                    
                    errors.push("Expected lower case file extension:\n" + fileToValidate);
                }
            }
        }
    }
   
    // TODO - validate the case for all the files and folders    
    // TODO - validate that gitIgnore file structure is correct    
    // TODO - Check that no strange files or folders exist
}


/**
 * Validates the content of the project files
 */
let validateFilesContent = function () {
    
    validateNoTabulations();
    
    validateCopyPasteDetect();
     
    validateCopyrightHeaders();
}


/**
 * Validates that no tabulations exist on the project
 */
let validateNoTabulations = function () {

    let sep = fm.dirSep();

    if(global.setup.validate.filesContent.tabsForbidden.enabled){
    
        let excludedStrings = global.setup.validate.filesContent.tabsForbidden.excludes
            .concat([".ico", ".jpg", ".png", ".ttf", ".phar", ".woff"]);
    
        for(let affectedPath of global.setup.validate.filesContent.tabsForbidden.affectedPaths){
        
            let projectFolder = global.runtimePaths.root + sep + affectedPath;
        
            if(fm.isDirectory(projectFolder)) {
        
                let files = fm.findDirectoryItems(projectFolder, /^.*\.*$/i, 'absolute', 'files', -1, /libs(\/|\\)/);
                
                for (let file of files){
                    
                    if(!isFileOnExcludeList(file, excludedStrings) &&
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
}


/**
 * Validates copy pasted code on the project
 */
let validateCopyPasteDetect = function () {
    
    // Aux method to clean the .jscpd folder if it exists
    let cleanJscpdFolder = () => {
        
        if(fm.isDirectory('./.jscpd')){
            
            try{
               
               fm.deleteDirectory('./.jscpd', true, 45);
                
            }catch(e){
                
                cm.error('The .jscpd folder could not be deleted. Please delete it manually');
            }            
        }       
    };
    
    for (let copyPasteEntry of global.setup.validate.filesContent.copyPasteDetect){
        
        if(copyPasteEntry.maxPercentErrorLevel >= 0){
            
            cm.text('Looking for duplicate code on ' + copyPasteEntry.path);
            
            let jscpdExecIgnore = ' --ignore "**/*.phar,**/*.min.js,**/*.map,**/libs/**"';
            let jscpdExecMaxLimits = ' --max-size 250kb --max-lines 8000';
            let jscpdExecCommand = global.installationPaths.jscpdBin + jscpdExecIgnore + jscpdExecMaxLimits + ' --reporters console';
            
            // Define the report output path if necessary
            if(copyPasteEntry.report && copyPasteEntry.report !== ''){
                
                let projectName = setupModule.getProjectName();
                
                if(global.isRelease){
                    
                    projectName += "-" + setupModule.getProjectRepoSemVer(true);
                }
                
                jscpdExecCommand += ',' + copyPasteEntry.report + ' -o "target/' + projectName + '/reports/copypaste/' +
                    StringUtils.replace(copyPasteEntry.path, ['/', '\\'], '-') + '"';
            }
            
            jscpdExecCommand += ' "' + copyPasteEntry.path + '"';
            jscpdExecCommand += ' --threshold ' + copyPasteEntry.maxPercentErrorLevel;
        
            let jscpdResult = terminalManager.exec(jscpdExecCommand + ' --silent').output;

            if(jscpdResult.indexOf('ERROR') >= 0){
                
                cm.error(`Found too much duplicate code. Generating report...`, false);
                
                terminalManager.exec(jscpdExecCommand, true);
                
                cleanJscpdFolder();
                
                cm.error('Setup the copy paste validation on ' + global.fileNames.setup + ' under validate.filesContent.copyPasteDetect section');
            
            }else{
                
                let realCodePercentage = Number(jscpdResult.substring(jscpdResult.indexOf('(') + 1, jscpdResult.indexOf('%)')));
                                                
                cm.success(`Percentage of duplicate code: ${realCodePercentage} (maximum allowed: ${copyPasteEntry.maxPercentErrorLevel})`);
                
                if(copyPasteEntry.maxPercentErrorDifference >= 0){
                    
                    if(realCodePercentage < copyPasteEntry.maxPercentErrorLevel &&
                       Math.abs(realCodePercentage - copyPasteEntry.maxPercentErrorLevel) > copyPasteEntry.maxPercentErrorDifference){
                        
                        cleanJscpdFolder();
                        
                        cm.error(`The percentage of duplicate code on the project is ${realCodePercentage} which is too below from ` +
                            `the maxPercentErrorLevel of ${copyPasteEntry.maxPercentErrorLevel} (max expected difference is ` +
                            `${copyPasteEntry.maxPercentErrorDifference}). Please lower the maxPercentErrorLevel value to make it closer to the real one`);
                    }
                }
            }            
        }
    }
    
    cleanJscpdFolder();
}


/**
 * Validates the copyright headers
 */
let validateCopyrightHeaders = function () {
    
    for (let validator of global.setup.validate.filesContent.copyrightHeaders) {
    
        if(!fm.isFile(global.runtimePaths.root + fm.dirSep() + validator.path)){
        
            cm.error("Copyrhight headers template not found:\n" + global.runtimePaths.root + fm.dirSep() + validator.path);
        }
    
        let header = fm.readFile(global.runtimePaths.root + fm.dirSep() + validator.path).replace(/(?:\r\n|\r|\n)/g, "\n");
        
        if(!ArrayUtils.isArray(validator.affectedPaths)){
        
            cm.error(global.fileNames.setup + " copyrightHeaders affectedPaths must be an array");
        }
        
        for (let affectedPath of validator.affectedPaths) {
        
            let filesToValidate = getFilesFromIncludeList(global.runtimePaths.root + fm.dirSep() + affectedPath,
                validator.includes, validator.excludes);
            
            for (let fileToValidate of filesToValidate){
                
                if(fm.readFile(fileToValidate).replace(/(?:\r\n|\r|\n)/g, "\n").indexOf(header) !== 0){
                    
                    errors.push("Bad copyright header:\n" + fileToValidate + "\nMust be as defined in " + validator.path + "\n");
                }
            }
        }
    }
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
        
        if(global.setup.validate.styleSheets.cssHardcodedColorForbid &&
           /^(?!\$).*:.*(#|rgb).*$/im.test(cssContents)) {
                
            errors.push("File contains hardcoded css color: " + cssFile);
        }
    }
}


/**
 * Validates the php code
 */
let validatePhp = function () {
    
    // Obtain the list of files to validate, excluding any existing libs folder
    if(global.setup.validate.php){
            
        let filesToValidate = fm.findDirectoryItems(global.runtimePaths.main , /.*\.php$/i, 'absolute', 'files', -1, /libs(\/|\\)/);
            
        // Perform the php namespaces validation
        if(global.setup.validate.php.namespaces &&
           global.setup.validate.php.namespaces.enabled){
        
            // Auxiliary function to perform namespace validations
            function validateAux(namespaceToCheck, fileAbsolutePath, mustContainList){
                
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
            
            for (let fileToValidate of filesToValidate){
                
                if(!isFileOnExcludeList(fileToValidate, global.setup.validate.php.namespaces.excludes)){
                    
                    var fileContents = fm.readFile(fileToValidate);
                    
                    if(fileContents.indexOf("namespace") >= 0){
        
                        var namespace = StringUtils.trim(fileContents.split("namespace")[1].split(";")[0]);
                        
                        var validateNamespace = validateAux(namespace, fileToValidate, global.setup.validate.php.namespaces.mustContain);
                        
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

    let viewsPath = global.runtimePaths.root + '/src/main/view/views/';
    
    // Validations that affect both site_php and server_php projects
    if(global.setup.build.site_php || global.setup.build.server_php){
        
        let turbositeSetup = JSON.parse(fm.readFile(global.runtimePaths.root + fm.dirSep() + global.fileNames.turboSiteSetup));
        let turbodepotSetup = JSON.parse(fm.readFile(global.runtimePaths.root + fm.dirSep() + global.fileNames.turboDepotSetup));
        
        // If the logs source on turbodepot is not specified, a warning will be shown telling the user that no logs will be available
        if(StringUtils.isEmpty(turbodepotSetup.depots[0].logs.source)){
            
            warnings.push(`IMPORTANT! turbodepot.json logs.source property is empty on ${turbodepotSetup.depots[0].name}. No logs will be written for this project`);
        }
        
        // Validate that defined home and singleparam views exist
        let validateView = (viewName, errorMsg) => {
            
            if(!StringUtils.isEmpty(viewName)){
                
                let viewPhpPath = viewsPath + viewName + '/' + viewName + '.php';
                
                if(!fm.isFile(viewPhpPath)){
                    
                    errors.push(errorMsg + ' defined at ' + global.fileNames.turboSiteSetup + " does not exist:\n" + viewPhpPath);
                }
            }
        };
        
        validateView(turbositeSetup.homeView, 'Home view');
        validateView(turbositeSetup.singleParameterView, 'Single parameter view');
            
        // TODO - echo and print_r commands are not allowed on webservices. If found, a warning will be launched on build and an error on release      
    }
    
    // Validations that affect only site_php projects
    if(global.setup.build.site_php){
            
        // Validate that all the views are correctly defined and structured
        let viewNames = fm.getDirectoryList(global.runtimePaths.root + '/src/main/view/views'); 
        
        for (let viewName of viewNames){

            let viewPath = viewsPath + viewName;
            let viewPhpPath = viewPath + '/' + viewName + '.php';
    
            // the view name must be lower case
            if(viewName.toLowerCase() !== viewName){

                errors.push(viewName + ' view folder must be lower case:\n' + viewPath); 
            }
            
            // The view js file must exist
            if(!fm.isFile(viewPath + '/' + viewName + '.js')){

                errors.push(viewName + '.js does not exist for view ' + viewName + ':\n' + viewPath); 
                return;
            }
            
            // the view php file must exist
            if(!fm.isFile(viewPhpPath)){

                errors.push(viewName + '.php does not exist for view ' + viewName + ':\n' + viewPath);
                return;
            }
            
            // the view scss file must exist
            if(!fm.isFile(viewPath + '/' + viewName + '.scss')){

                errors.push(viewName + '.scss does not exist for view ' + viewName + ':\n' + viewPath);
                return;
            }
            
            // All files inside the view folder must be lower case
            let viewFiles = fm.getDirectoryList(viewPath + '/');
            
            for (let viewFile of viewFiles){
                
                if(viewFile.toLowerCase() !== viewFile){
    
                    errors.push(`All files inside the ${viewName} view folder must be lower case:\n` + viewPath);
                    return;
                }
            }
            
            // Read the php code of the view to analyze it
            let viewHtmlCode = fm.readFile(viewPhpPath);
            let viewHtmlCodeCleaned = StringUtils.replace(viewHtmlCode, [' ', "\n", "\r"], '');

            // Make sure view starts with <?php use .....; $ws = WebSiteManager::getInstance();
            if(!(new RegExp(/^<.php(use[^;]*;)+\$[^;-]*=WebSiteManager::getInstance..;/)).test(viewHtmlCodeCleaned)){

                errors.push(viewName + ' view must start with: <?php use .....; $ws = WebSiteManager::getInstance();\n' + viewPhpPath); 
            }
            
            // Make sure view contains the right html and php tags in the right order
            if(!(new RegExp(/^<\?php.*\?><.doctypehtml><htmllang="<\?phpecho\$.*->getPrimaryLanguage\(\)\?>"><head>.*<\?php.*->echoHtmlHead\(\)\?>.*<\/head><body>.*<\/body><\/html>$/)).test(viewHtmlCodeCleaned)){

                errors.push(viewName + ' view structure php or html tags are incorrect, please fix them:\n' + viewPhpPath); 
            }
                      
            // Make sure view ends with <?php $ws->echoHtmlJavaScriptTags() ?></body></html>
            if(!viewHtmlCode.endsWith('/html>') ||
               !viewHtmlCodeCleaned.endsWith('<?php$ws->echoHtmlJavaScriptTags()?></body></html>')){

                errors.push(viewName + ' view must end with <?php $ws->echoHtmlJavaScriptTags() ?></body></html> and no extra characters:\n' + viewPhpPath); 
            }
        }
    }
}


/**
 * Validates javascript files
 */
let validateJavascript = function () {

    if(!global.setup.validate.javascript){
    
        return;
    }
    
    let filesToValidate = getFilesFromIncludeList(global.runtimePaths.src,
        global.setup.validate.javascript.useStrict.includes, global.setup.validate.javascript.useStrict.excludes);
        
    for (let file of filesToValidate){
        
        // Check if js files must contain "use strict" at the very first beginning of the file
        if(global.setup.validate.javascript.useStrict.enabled) {
          
            let jsContents = fm.readFile(file);
            
            if(jsContents.indexOf('#!/usr/bin') === 0){
            
                if((jsContents.indexOf('use strict') < 0 && jsContents.indexOf("'use strict'") < 0) ||
                   (jsContents.indexOf('use strict') > 24 && jsContents.indexOf("'use strict'") > 24)){
                          
                    errors.push('File must have "use strict" after #!/usr/bin:\n' + file);
                }
                
            }else if(jsContents.indexOf('"use strict"') !== 0 && jsContents.indexOf("'use strict'") !== 0){
                      
                errors.push('File must start with "use strict": ' + file);
            }
        }
    }
}


/**
 * Validates angular application
 */
let validateAngularApp = function () {
    
    if(!global.setup.build.app_angular || !global.setup.validate.angularApp){
    
        return;
    }
    
    // Get the main index html file for the angular application
    let indexHtmlCode = fm.readFile(global.runtimePaths.src + fm.dirSep() + 'index.html');
    
    if(global.setup.validate.angularApp.noLegacyFavicon &&
       indexHtmlCode.indexOf('favicon.ico') >= 0){
        
        cm.error("Deprecated favicon.ico metadata is not allowed. Please remove it from index.html");
    }
    
    if(global.setup.validate.angularApp.forceOverscrollContain &&
       indexHtmlCode.indexOf('overscroll-behavior: contain') < 0){
        
        cm.error('style="overscroll-behavior: contain" is mandatory on index.html <body> tag to prevent scroll reloading on mobile browsers');
    }
    
    if(global.setup.validate.angularApp.forceMobileWebAppCapable &&
       indexHtmlCode.indexOf('name="mobile-web-app-capable" content="yes"') < 0){
        
        cm.error('<meta name="mobile-web-app-capable" content="yes"> is mandatory on index.html to enable app-like features on mobile browsers');
    }
    
    if(global.setup.validate.angularApp.forceHttpsWithHtaccess &&
       (!fm.isFile(global.runtimePaths.src + fm.dirSep() + 'htaccess.txt') ||
        fm.readFile(global.runtimePaths.src + fm.dirSep() + 'htaccess.txt')
            .indexOf('RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]') < 0)){
        
        cm.error('src/htaccess.txt must exist and redirect all urls from http to https with the following code:\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
    }
    
    // Use angular cli to run the tslint verification for angular projects
    if((global.setup.build.app_angular && global.setup.validate.angularApp.lintEnabled) ||
        global.setup.build.lib_angular){
    
        cm.text("\nLaunching ng lint");
        
        if(terminalManager.exec('"./node_modules/.bin/ng" lint', true).failed){
            
            cm.error("angular lint validate failed");
        }        
    }
}