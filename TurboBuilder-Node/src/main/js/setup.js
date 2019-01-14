'use strict';

/**
 * this module contains all the code related to the setup data
 */


const { FilesManager, ObjectUtils } = require('turbocommons-ts');
const console = require('./console.js');
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');
const validateModule = require('./validate');
const buildModule = require('./build');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Initialize the setup structure from the project json
 */
exports.init = function () {
    
    global.setup = global.isRelease ? this.loadReleaseSetupFromDisk() : this.loadSetupFromDisk();

    validateModule.validateBuilderVersion();
}


/**
 * Obtain the current project name.
 */
exports.getProjectName = function () {
    
    if(global.setup && global.setup.metadata && global.setup.metadata.name){
    
        return global.setup.metadata.name;
    }
    
    if (fm.isFile(global.runtimePaths.setupFile)) {
        
        try{
        
            let projectSetup = JSON.parse(fm.readFile(global.runtimePaths.setupFile));
            
            if(projectSetup.metadata && projectSetup.metadata.name &&
                    !StringUtils.isEmpty(projectSetup.metadata.name)){
            
                return projectSetup.metadata.name;
            }
            
        }catch(e){
            
            console.error("Corrupted JSON for " + global.runtimePaths.setupFile + ":\n" + e.toString());
        }
    }
    
    return global.runtimePaths.projectFolderName;
}


/**
 * Calculate the turbo builder cmd current version
 */
exports.getBuilderVersion = function () {
    
    return StringUtils.trim(require(global.installationPaths.root + '/package.json').version);
}


/**
 * Calculate the most recent project semantic version value (major.minor.patch) depending on git tags or other parameters
 */
exports.getProjectRepoSemVer = function (includeGitCommits = false) {
        
    buildModule.checkGitAvailable();

    let commitsCount = this.countCommitsSinceLatestTag();
    
    let gitCommits = (includeGitCommits && commitsCount > 0) ? ' +' + commitsCount : '';
    
    try{
        
        let execResult = execSync('git describe --abbrev=0 --tags', {stdio : 'pipe'});
        
        return StringUtils.trim(execResult.toString()) + gitCommits;
        
    }catch(e){

        return '0.0.0';
    }    
}


/**
 * Count the number of commits since the most recent git tag
 */
exports.countCommitsSinceLatestTag = function () {
    
    buildModule.checkGitAvailable();
    
    try{
        
        let execResult = execSync('git describe --abbrev=0 --tags', {stdio : 'pipe'});
        
        execResult = execSync('git rev-list ' + StringUtils.trim(execResult.toString()) + '.. --count', {stdio : 'pipe'});
        
        return StringUtils.trim(execResult.toString());
        
    }catch(e){

        return '0';
    }    
}


/**
 * Read the json setup file from the current project
 */
exports.loadSetupFromDisk = function () {

    if (!fm.isFile(global.runtimePaths.setupFile)) {
    
        console.error(global.fileNames.setup + ' setup file not found');
    }
    
    let projectSetup = '';
    
    try{
        
        projectSetup = JSON.parse(fm.readFile(global.runtimePaths.setupFile));
        
    }catch(e){
        
        console.error("Corrupted JSON for " + global.runtimePaths.setupFile + ":\n" + e.toString());
    }
    
    // Load the template setup
    let templateSetup = this.customizeSetupTemplateToProjectType(this.detectProjectTypeFromSetup(projectSetup));
    
    // Merge the project setup into the template one
    ObjectUtils.merge(templateSetup, projectSetup);
    
    return templateSetup;
};


/**
 * Read the json setup file from the current project and override it with the release setup if it exists
 */
exports.loadReleaseSetupFromDisk = function () {
    
    let setup = module.exports.loadSetupFromDisk();
    
    // Check if turbobuilder.release.json must be also merged into the setup
    if(fm.isFile(global.runtimePaths.setupReleaseFile)){

        try{
            
            let projectReleaseSetup = JSON.parse(fm.readFile(global.runtimePaths.setupReleaseFile));
            
            ObjectUtils.merge(setup, projectReleaseSetup);
            
        }catch(e){
            
            console.error("Corrupted JSON for " + global.runtimePaths.setupFile + ":\n" + e.toString());
        }
    }
    
    return setup;
};


/**
 * Detect the project type that is specified on the provided setup object
 */
exports.detectProjectTypeFromSetup = function (setup) {

    let projectType = '';
    let projectTypesCount = 0;
    
    if(setup.build){
        
        for (let key of ObjectUtils.getKeys(setup.build)) {
            
            if(global.setupBuildTypes.indexOf(key) >= 0){
                
                projectType = key;
                projectTypesCount ++;
            }
        }
    }
    
    if(projectType === ''){
        
        console.error("No valid project type specified. Please enable any of [" + 
            global.setupBuildTypes.join(', ') + "] under build section in " + global.fileNames.setup);
    }
    
    if(projectTypesCount !== 1){
        
        console.error("Please specify only one of the following on build setup: " + global.setupBuildTypes.join(","));
    }
    
    return projectType;
};


/**
 * Generate a turbobuilder json setup file based on the specified project type
 */
exports.customizeSetupTemplateToProjectType = function (type) {
    
    // Read the default template setup file
    let templateSetupPath = global.installationPaths.mainResources + fm.dirSep() + 'project-templates'
        + fm.dirSep() + 'shared' + fm.dirSep() + global.fileNames.setup;
    
    let setupContents = JSON.parse(fm.readFile(templateSetupPath));
    
    // Customize the metadata section
    setupContents.metadata.builderVersion = this.getBuilderVersion();
    
    // Customize the validate section
    setupContents.validate.copyrightHeaders = [];
    
    if(type !== 'site_php'){
        
        delete setupContents.validate['sitePhp'];
        
        if(type !== 'lib_php'){
            
            delete setupContents.validate['phpNamespaces'];
        }
    }
    
    // Customize the build section
    for (let key of ObjectUtils.getKeys(setupContents.build)) {
        
        if(key !== type && global.setupBuildTypes.indexOf(key) >= 0){
            
            delete setupContents.build[key]; 
        }
    }
    
    // Customize the release section
    if(type === 'app_angular' || type === 'lib_angular'){
        
        delete setupContents.release.optimizePictures;
        delete setupContents.release.generateCodeDocumentation;
    }
    
    // Customize the sync section
    delete setupContents.sync;
    
    if(type === 'site_php' || type === 'server_php'){
        
        setupContents.sync = {
            "runAfterBuild": false,
            "type": "fileSystem",
            "excludes": [],
            "sourcePath": "dist/",
            "destPath": "C:/turbosite-webserver-symlink/build",
            "remoteUrl": "https://localhost/build",
            "deleteDestPathContents": true
        };
    }
    
    // Customize the test section
    let testArray = [];
    
    for (let testItem of setupContents.test) {
        
        if((type === 'server_php' || type === 'lib_php') &&
            testItem.type === 'phpUnit'){

            testArray.push(testItem);
        }
        
        if((type === 'site_php' || type === 'lib_js' || type === 'lib_ts') &&
            testItem.type === 'jasmine'){

            testArray.push(testItem);
        }
    }
    
    setupContents.test = testArray;
    
    return setupContents;        
}