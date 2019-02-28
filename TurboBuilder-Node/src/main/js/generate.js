'use strict';

/**
 * this module contains all the code related to the generate process
 */


const { FilesManager, StringUtils, ObjectUtils } = require('turbocommons-ts');
const console = require('./console');
const setupModule = require('./setup');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Execute the generate process
 */
exports.execute = function (type) {

    validate(type);
    
    console.log("\ngenerate " + type + " start");
    
    if(ObjectUtils.getKeys(global.folderStructures).indexOf(type) >= 0){
    
        createFoldersStructure(type);
        
        console.success('Generated folders structure ok');
        
    } else {
        
        createProjectStructure(type);
        
        console.success('Generated project structure ok');    
    }
};


/**
 * Check if project structure can be created
 */
let validate = function (type) {

    let validTypes = ObjectUtils.getKeys(global.setupBuildTypes).concat(ObjectUtils.getKeys(global.folderStructures));

    if(validTypes.indexOf(type) < 0){
        
        console.error("invalid project type. Allowed types: " + validTypes.join(', '));
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
 * Generate the requested folders structure
 */
let createFoldersStructure = function (type) {

    let sep = fm.dirSep();

    // Generate all the folders and files that are used on a remote location where projects are deployed.
    if (type === global.folderStructures.struct_deploy) {
    
        fm.createDirectory(global.runtimePaths.root + sep + 'trash');
        fm.createDirectory(global.runtimePaths.root + sep + 'site');
        fm.createDirectory(global.runtimePaths.root + sep + 'release');
        fm.createDirectory(global.runtimePaths.root + sep + 'build');
        fm.createDirectory(global.runtimePaths.root + sep + 'data' + sep + 'tmp', true);
        fm.createDirectory(global.runtimePaths.root + sep + 'data' + sep + 'storage', true);
        fm.createDirectory(global.runtimePaths.root + sep + 'data' + sep + 'db', true);
        fm.createDirectory(global.runtimePaths.root + sep + 'data' + sep + 'binary', true);        
    }
        
    // Generate all the folders and files that are used on a customer folder
    if (type === global.folderStructures.struct_customer) {

        fm.createDirectory(global.runtimePaths.root + sep + 'Documents');
        fm.createDirectory(global.runtimePaths.root + sep + 'Release');  
        fm.createDirectory(global.runtimePaths.root + sep + 'Repo');  
        fm.createDirectory(global.runtimePaths.root + sep + 'Trash');      
    }  
}


/**
 * Generate the project folders and files on the current runtime directory
 */
let createProjectStructure = function (type) {
    
    let sep = fm.dirSep();
    let templatesFolder = global.installationPaths.mainResources + sep + 'project-templates';
    
    // Copy the project type specific files
    let filesToCopy = templatesFolder + sep + (type === global.setupBuildTypes.server_php ? global.setupBuildTypes.site_php : type);
    
    fm.copyDirectory(filesToCopy, global.runtimePaths.root);
    
    // Copy the extras folder
    fm.createDirectory(global.runtimePaths.extras);
    
    if(!fm.copyDirectory(templatesFolder + sep + 'shared' + sep + 'extras', global.runtimePaths.extras, false)){
    
        console.error('Failed creating: ' + global.runtimePaths.extras);
    }
    
    // The expected-ftp-structure.md file is not necessary on some project types
    if(type !== global.setupBuildTypes.site_php &&
       type !== global.setupBuildTypes.server_php &&
       type !== global.setupBuildTypes.app_angular){

        fm.deleteFile(global.runtimePaths.extras + sep + 'help' + sep + 'expected-ftp-structure.md');
    }
    
    // Server php project is basically a site_php project but with some parts removed
    if(type === global.setupBuildTypes.server_php){
    
        fm.deleteDirectory(global.runtimePaths.main + sep + 'view');
        fm.deleteDirectory(global.runtimePaths.main + sep + 'resources' + sep + 'favicons');
        fm.deleteDirectory(global.runtimePaths.main + sep + 'resources' + sep + 'fonts');
        
        let localesReadmeContent = fm.readFile(global.runtimePaths.main + sep + 'resources' + sep + 'locales' + sep + 'readme.txt');
        fm.deleteDirectory(global.runtimePaths.main + sep + 'resources' + sep + 'locales', false);
        fm.saveFile(global.runtimePaths.main + sep + 'resources' + sep + 'locales' + sep + 'readme.txt', localesReadmeContent);
        
        fm.deleteDirectory(global.runtimePaths.test + sep + 'js', false);
        fm.saveFile(global.runtimePaths.test + sep + 'js' + sep + 'TODO.txt', 'To get a js tests template you can generate a site_php project and copy them from there');
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
    
    replaceDependenciesIntoTemplate();
    
    console.success('Generated ' + type + ' structure');
    
    // Generate a custom project setup and save it to file
    if(!fm.saveFile(global.runtimePaths.setupFile,
            JSON.stringify(setupModule.customizeSetupTemplateToProjectType(type), null, 4))){
        
        console.error('Error creating ' + global.fileNames.setup + ' file');
    }
    
    console.success('Created ' + global.fileNames.setup + ' file');
    
    if(type === global.setupBuildTypes.app_angular){
        
        console.warning("\nNOT FINISHED YET! - Remember to follow the instructions on TODO.md to complete the project setup\n");
    }
}


/**
 * Replaces all the template dummy files (called *.tbdependency) with the real library ones.
 * Doing it this way we keep all the big files on a single location
 */
let replaceDependenciesIntoTemplate = function () {
    
    let sep = fm.dirSep();
    let libsPath = global.installationPaths.mainResources + sep + 'libs';

    let tbdependencies = fm.findDirectoryItems(global.runtimePaths.root, /^.*\.tbdependency$/, 'absolute');
    
    for(let tbdependency of tbdependencies){
        
        let depFile = StringUtils.getPathElement(tbdependency);
        let depParent = StringUtils.replace(tbdependency, StringUtils.getPathElement(tbdependency), '');
        
        
        if(depFile === 'normalize.tbdependency'){
            
            fm.copyFile(libsPath + sep + 'normalize.css', depParent + sep + 'normalize.css');
        }
        
        if(depFile === 'jquery.tbdependency'){
            
            fm.copyFile(libsPath + sep + 'jquery.js', depParent + sep + 'jquery.js');
        }
        
        if(depFile === 'turbocommons-es5.tbdependency'){
            
            fm.copyFile(libsPath + sep + 'turbocommons-es5.js', depParent + sep + 'turbocommons-es5.js');
        }
        
        if(depFile === 'turbocommons-php.tbdependency'){
            
            fm.copyFile(libsPath + sep + 'TurboCommons-Php-0.7.3.phar', depParent + sep + 'TurboCommons-Php-0.7.3.phar');
        }
        
        if(depFile === 'turbosite.tbdependency'){
            
            fm.copyFile(libsPath + sep + 'turbosite-php-0.3.0.phar', depParent + sep + 'turbosite-php-0.3.0.phar');
        }

        fm.deleteFile(tbdependency);
    }
}