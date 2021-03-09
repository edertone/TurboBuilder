'use strict';

/**
 * this module contains all the code related to the generate process
 */


const { StringUtils, ObjectUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { ConsoleManager } = require('turbodepot-node');
const setupModule = require('./setup');


let fm = new FilesManager();
const cm = new ConsoleManager();


/**
 * Execute the generate process
 */
exports.execute = function (type) {

    validate(type);
    
    cm.text("\ngenerate " + type + " start");
    
    if(ObjectUtils.getKeys(global.folderStructures).indexOf(type) >= 0){
    
        createFoldersStructure(type);
        
        cm.success('Generated folders structure ok');
        
    } else {
        
        createProjectStructure(type);
        
        cm.success('Generated project structure ok');    
    }
};


/**
 * Check if project structure can be created
 */
let validate = function (type) {

    let validTypes = ObjectUtils.getKeys(global.setupBuildTypes).concat(ObjectUtils.getKeys(global.folderStructures));

    if(validTypes.indexOf(type) < 0){
        
        cm.error("invalid project type. Allowed types:\n\n" + validTypes.join("\n"));
    }
    
    let templateSetupPath = global.installationPaths.mainResources + fm.dirSep() + 'project-templates' + fm.dirSep() + 'shared' + fm.dirSep() + global.fileNames.setup;
    
    if (fm.isFile(global.runtimePaths.setupFile)) {
        
        cm.error('File ' + global.fileNames.setup + ' already exists');
    }
    
    if (!fm.isFile(templateSetupPath)) {
        
        cm.error(templateSetupPath + ' file not found');
    }
    
    if(!fm.isDirectoryEmpty(global.runtimePaths.root)){
        
        cm.error('Current folder is not empty! :' + global.runtimePaths.root);
    }
}


/**
 * Generate the requested folders structure
 */
let createFoldersStructure = function (type) {

    let sep = fm.dirSep();
    let templatesFolder = global.installationPaths.mainResources + sep + 'project-templates';

    // Generate all the folders and files that are used on a remote location where projects are deployed.
    if (type === global.folderStructures.struct_deploy) {
    
        fm.createDirectory(global.runtimePaths.root + sep + '_dev');
        fm.createDirectory(global.runtimePaths.root + sep + '_trash');
        fm.createDirectory(global.runtimePaths.root + sep + 'site');
        fm.createDirectory(global.runtimePaths.root + sep + 'storage' + sep + 'cache', true);
        fm.createDirectory(global.runtimePaths.root + sep + 'storage' + sep + 'custom', true);
        fm.createDirectory(global.runtimePaths.root + sep + 'storage' + sep + 'db', true);
        fm.createDirectory(global.runtimePaths.root + sep + 'storage' + sep + 'data', true);
        fm.createDirectory(global.runtimePaths.root + sep + 'storage' + sep + 'executable', true);
        fm.createDirectory(global.runtimePaths.root + sep + 'storage' + sep + 'logs', true);        
        fm.createDirectory(global.runtimePaths.root + sep + 'storage' + sep + 'tmp', true);
        fm.copyFile(templatesFolder + sep + 'struct_deploy' + sep + 'README.txt', global.runtimePaths.root + sep + 'storage' + sep + 'README.txt');
    }
        
    // Generate all the folders and files that are used on a customer folder
    if (type === global.folderStructures.struct_customer) {

        fm.createDirectory(global.runtimePaths.root + sep + 'Documents');
        fm.saveFile(global.runtimePaths.root + sep + 'Documents' + sep + 'Contact.md', '');
        fm.saveFile(global.runtimePaths.root + sep + 'Documents' + sep + 'Passwords.md', '');
        
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
    
    // Copy the extras folder
    fm.createDirectory(global.runtimePaths.extras);
    
    if(!fm.copyDirectory(templatesFolder + sep + 'shared' + sep + 'extras', global.runtimePaths.extras)){
    
        cm.error('Failed creating: ' + global.runtimePaths.extras);
    }
    
    // Copy the project type specific files
    let filesToCopy = templatesFolder + sep + (type === global.setupBuildTypes.server_php ? global.setupBuildTypes.site_php : type);
    
    fm.copyDirectory(filesToCopy, global.runtimePaths.root, false);
        
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
        
        // Clear the homeView and singleParameterView values on the turbosite setup file
        let tsSetup = JSON.parse(fm.readFile(global.runtimePaths.root + sep + global.fileNames.turboSiteSetup));
        
        tsSetup.homeView = '';
        tsSetup.singleParameterView = '';
        
        fm.saveFile(global.runtimePaths.root + sep + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup, null, 4));       
        
        // Overwrite the site_php files with the server_php specific ones
        fm.copyDirectory(templatesFolder + sep + global.setupBuildTypes.server_php, global.runtimePaths.root, false);
    }
    
    // Tests project does not require some files
    if(type === global.setupBuildTypes.test_project){

        fm.deleteFile(global.runtimePaths.root + sep + 'extras' + sep + 'help' + sep + 'publish-release.md');
        fm.deleteFile(global.runtimePaths.root + sep + 'extras' + sep + 'todo' + sep + 'features.todo');
    }
    
    // Create readme file
    if(!fm.copyFile(templatesFolder + sep + 'shared' + sep + global.fileNames.readme,
       global.runtimePaths.root + sep + global.fileNames.readme)){
        
        cm.error('Failed creating: ' + global.runtimePaths.root + sep + global.fileNames.readme);
    }
    
    // Copy the gitignore file
    if(!fm.copyFile(templatesFolder + sep + 'shared' + sep + 'gitignore.txt',
        global.runtimePaths.root + sep + global.fileNames.gitignore)){
         
        cm.error('Failed creating: ' + global.runtimePaths.root + sep + global.fileNames.gitignore);
    }
    
    // Copy the gitattributes file
    if(!fm.copyFile(templatesFolder + sep + 'shared' + sep + 'gitattributes.txt',
        global.runtimePaths.root + sep + global.fileNames.gitattributes)){
         
        cm.error('Failed creating: ' + global.runtimePaths.root + sep + global.fileNames.gitattributes);
    }
    
    replaceDependenciesIntoTemplate();
    
    cm.success('Generated ' + type + ' structure');
    
    // Generate a custom project setup and save it to file
    try{
        
        let generatedSetup = setupModule.customizeSetupTemplateToProjectType(type);
        
        if(type === global.setupBuildTypes.test_project){

            delete generatedSetup.release;
            delete generatedSetup.validate;            
        }
        
        fm.saveFile(global.runtimePaths.setupFile, JSON.stringify(generatedSetup, null, 4));
            
    }catch(e){
        
        cm.error('Error creating ' + global.fileNames.setup + ' file');
    }
    
    cm.success('Created ' + global.fileNames.setup + ' file');
    
    if(type === global.setupBuildTypes.app_angular){
        
        // Copy the default favicons from the site_php template
        fm.createDirectory(`${global.runtimePaths.root}${sep}src${sep}assets${sep}favicons`);
        
        fm.copyDirectory(`${templatesFolder}${sep}site_php${sep}src${sep}main${sep}resources${sep}favicons`,
                         `${global.runtimePaths.root}${sep}src${sep}assets${sep}favicons`);
        
        cm.warning("\nNOT FINISHED YET! - Remember to follow the instructions on TODO.md to complete the project setup\n");
    }
}


/**
 * Replaces all the template dummy files (called *.tbdependency) with the real library ones.
 * Doing it this way we keep all the big files on a single location
 */
let replaceDependenciesIntoTemplate = function () {
    
    let sep = fm.dirSep();
    let libsPath = global.installationPaths.main + sep + 'libs';

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
            
            fm.copyFile(libsPath + sep + 'turbocommons-php-3.7.0.phar', depParent + sep + 'turbocommons-php-3.7.0.phar');
        }
        
        if(depFile === 'turbodepot-php.tbdependency'){
            
            fm.copyFile(libsPath + sep + 'turbodepot-php-7.0.1.phar', depParent + sep + 'turbodepot-php-7.0.1.phar');
        }
        
        if(depFile === 'turbosite-php.tbdependency'){
            
            fm.copyFile(libsPath + sep + 'turbosite-php-8.1.0.phar', depParent + sep + 'turbosite-php-8.1.0.phar');
        }

        fm.deleteFile(tbdependency);
    }
}