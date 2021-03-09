'use strict';

/**
 * this module contains all the code related to the setup data
 */


require('./globals');

const { ObjectUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { ConsoleManager } = require('turbodepot-node');
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');
const validateModule = require('./validate');
const buildModule = require('./build');


let fm = new FilesManager();
const cm = new ConsoleManager();


/**
 * Initialize the setup structure from the project json
 */
exports.init = function () {
    
    global.setup = this.loadSetupFromDisk(global.fileNames.setup, global.isRelease);

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
            
            cm.error("Corrupted JSON for " + global.runtimePaths.setupFile + ":\n" + e.toString());
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
 * obtain the full file system path to the for the .release.json file that is related to the provided setup file.
 * Note that this method does not check if it exsits, it must be previously verified with this.isReleaseSetupPresent()
 */
exports.getReleaseSetupFilePath = function (setupFile) {
        
    return global.runtimePaths.root + fm.dirSep() + StringUtils.getPathElementWithoutExt(setupFile) + '.release.json';
}


/**
 * Check if the .release.json file exists for the provided setup file (for example turbobuilder.json)
 */
exports.isReleaseSetupPresent = function (setupFile) {
        
    return fm.isFile(this.getReleaseSetupFilePath(setupFile));
}


/**
 * Get the contents for the .release.json file that is related to the provided setup file.
 * Note that this method does not check if it exsits, it must be previously verified with this.isReleaseSetupPresent()
 */
exports.getReleaseSetupFileContents = function (setupFile) {
        
    return fm.readFile(this.getReleaseSetupFilePath(setupFile));
}


/**
 * Read the specified json setup file from the project root and return a valid parsed object that represents it.
 * If isRelease is true and a .release.json setup file also exists, it will be merged with the base one.
 */
exports.loadSetupFromDisk = function (setupFile, isRelease) {

    // Read the specified setup data from disk
    let sep = fm.dirSep();
    let setup = {};
    
    if (!fm.isFile(global.runtimePaths.root + sep + setupFile)) {
    
        cm.error(setupFile + ' setup file not found');
    }

    try{
        
        let setupContents = fm.readFile(global.runtimePaths.root + sep + setupFile);
        
        // Replace all the setup wildcards if they have been defined at turbobuilder main setup file
        let turbobuilderSetup = JSON.parse(fm.readFile(global.runtimePaths.root + sep + global.fileNames.setup));
        
        if(turbobuilderSetup.wildCards && turbobuilderSetup.wildCards.setupWildCards){
        
            for(let wildCard of turbobuilderSetup.wildCards.setupWildCards){

                if(wildCard.enabled && wildCard.wildCard){
                    
                    let replacement = isRelease ? wildCard.releaseValue : wildCard.buildValue;

                    if(replacement){
                        
                        setupContents = StringUtils.replace(setupContents, wildCard.wildCard, replacement);
                    }
                }
            }
        }
        
        setup = JSON.parse(setupContents);
        
        if(setupFile === global.fileNames.setup){
        
            // read the base template setup for this project
            setup = this.customizeSetupTemplateToProjectType(this.detectProjectTypeFromSetup(setup));
            
            // Merge the project setup into the template one
            setup = ObjectUtils.merge(setup, JSON.parse(fm.readFile(global.runtimePaths.setupFile)));
        }
        
    }catch(e){
        
        cm.error("Corrupted JSON for " + global.runtimePaths.setupFile + ":\n" + e.toString());
    }
    
    // Check if .release.json must be also merged into the setup      
    if(isRelease && this.isReleaseSetupPresent(setupFile)){

        try{
            
            ObjectUtils.merge(setup, JSON.parse(this.getReleaseSetupFileContents(setupFile)));
            
        }catch(e){
            
            cm.error("Corrupted JSON for " + this.getReleaseSetupFilePath(setupFile) + ":\n" + e.toString());
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
    let buildTypes = ObjectUtils.getKeys(global.setupBuildTypes);
    
    if(setup.build){
        
        for (let key of ObjectUtils.getKeys(setup.build)) {
            
            if(buildTypes.indexOf(key) >= 0){
                
                projectType = key;
                projectTypesCount ++;
            }
        }
    }
    
    if(projectType === ''){
        
        cm.error("No valid project type specified. Please enable any of [" + 
            buildTypes.join(', ') + "] under build section in " + global.fileNames.setup);
    }
    
    if(projectTypesCount !== 1){
        
        cm.error("Please specify only one of the following on build setup: " + buildTypes.join(","));
    }
    
    return projectType;
};


/**
 * Generate a turbobuilder json setup object based on the specified project type
 */
exports.customizeSetupTemplateToProjectType = function (type) {
    
    // Read the default template setup file
    let templateSetupPath = global.installationPaths.mainResources + fm.dirSep() + 'project-templates'
        + fm.dirSep() + 'shared' + fm.dirSep() + global.fileNames.setup;
    
    let setupContents = JSON.parse(fm.readFile(templateSetupPath));
    
    // Customize the metadata section
    setupContents.metadata.builderVersion = this.getBuilderVersion();
    
    // Customize the validate section
    setupContents.validate.filesContent.copyrightHeaders = [];
    
    if(type !== global.setupBuildTypes.site_php &&
       type !== global.setupBuildTypes.server_php &&
       type !== global.setupBuildTypes.lib_php){
            
        delete setupContents.validate['php'];
    }
    
    if(type === global.setupBuildTypes.app_node_cmd){
            
        delete setupContents.validate['styleSheets'];
    }
    
    // Customize the build section
    for (let key of ObjectUtils.getKeys(setupContents.build)) {
        
        if(key !== type && ObjectUtils.getKeys(global.setupBuildTypes).indexOf(key) >= 0){
            
            delete setupContents.build[key]; 
        }
    }
    
    // Customize the release section
    if(type === global.setupBuildTypes.app_angular ||
       type === global.setupBuildTypes.lib_angular){
        
        delete setupContents.release.optimizePictures;
        delete setupContents.release.generateCodeDocumentation;
    
    }else{
        
        delete setupContents.validate.angularApp;
    }
    
    if(type === global.setupBuildTypes.app_node_cmd){
        
        setupContents.release = {};
    }
    
    if(type === global.setupBuildTypes.test_project){

        setupContents.build = {};
        setupContents.build[global.setupBuildTypes.test_project] = {};
    }
    
    // Customize the sync section
    delete setupContents.sync;
    
    if(type === global.setupBuildTypes.site_php || type === global.setupBuildTypes.server_php){
        
        setupContents.validate.php.namespaces = {
            "enabled": true,
            "mandatory": true,
            "mustContain": [
                "project\\src\\$path"
            ],
            "excludes": [
                "autoloader.php",
                "index.php",
                "error-404.php",
                "main\\view"
            ]
        }
        
        setupContents.sync = {
            "runAfterBuild": false,
            "type": "fileSystem",
            "excludes": [],
            "sourcePath": "dist/",
            "destPath": "C:/turbosite-webserver-symlink/_dev",
            "remoteUrl": "https://localhost/_dev",
            "deleteDestPathContents": true
        };
    }
    
    // Customize the test section
    let testArray = [];
    
    for (let testItem of setupContents.test.enabledTests) {
        
        if((type === global.setupBuildTypes.server_php ||
            type === global.setupBuildTypes.lib_php) &&
            testItem.type === 'phpUnit'){

            testArray.push(testItem);
        }
        
        if((type === global.setupBuildTypes.site_php ||
            type === global.setupBuildTypes.lib_js ||
            type === global.setupBuildTypes.lib_ts ||
            type === global.setupBuildTypes.app_node_cmd) &&
            testItem.type === 'jasmine'){

            testArray.push(testItem);
        }
        
        if(type === global.setupBuildTypes.test_project &&
            testItem.type === 'jasmine'){

            setupContents.test.warnIfCalledWithoutBuild = false;
            testArray.push(testItem);
        }
    }
    
    setupContents.test.enabledTests = testArray;
    
    return setupContents;        
}