#!/usr/bin/env node

'use strict';


/**
 * Methods that help with performing the tests
 */

const path = require('path');
require('./../../main/js/globals');
const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { execSync } = require('child_process');


let executionDir = path.resolve('./'); 


/**
 * A files manager object ready to be used by the tests
 */
exports.fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * The path to the turbobuilder executable to test
 */
exports.pathToExecutable = 'node "' + path.resolve(__dirname + '/../../main/js/turbobuilder.js') + '"';


/**
 * Switch the work directory back to the execution dir
 */
exports.switchToExecutionDir = function () {
  
    process.chdir(executionDir);
};


/**
 * Move the work directory to the specified folder inside the main temp folder.
 * If folder does not exist, it will be created
 */
exports.createAndSwitchToTempFolder = function (dirName) {
  
    let tmp = this.fm.createTempDirectory(dirName);
        
    process.chdir(tmp);
    
    return tmp;
};


/**
 * Generates the specified project type on the current  work dir and modifies all the specified
 * values for the given common properties.
 * The modified setup is saved and also returned in case we want to further modify it.
 * All setup values that we pass as null won't be altered
 */
exports.generateProjectAndSetTurbobuilderSetup = function (projectType,
    build = null,
    copyPasteDetect = null) {
  
    expect(this.exec('-g ' + projectType)).toContain("Generated project structure ok");
        
    let setup = this.readSetupFile();
    
    if(build !== null){
        
        setup.build = build;
    }
    
    if(copyPasteDetect !== null){
        
        setup.validate.filesContent.copyPasteDetect = copyPasteDetect;
    }
    
    expect(this.saveToSetupFile(setup)).toBe(true);
    
    return setup;
};


/**
 * Execute the project via cmd with the specified cmd arguments
 */
exports.exec = function (options) {
    
    return this.execCmdCommand(this.pathToExecutable + ' ' + options);
};


/**
 * Execute an arbitrary cmd command on the current active dir
 */
exports.execCmdCommand = function (cmdLine) {
    
    try{
        
        return execSync(cmdLine, {stdio : 'pipe'}).toString();
        
    }catch(e){
        
        if(!StringUtils.isEmpty(e.stderr.toString())){
            
            return e.stderr.toString();
        }
        
        return e.stdout.toString();
    }  
}


/**
 * Read the setup file from the current work dir and return it as a json object
 */
exports.readSetupFile = function () {
  
    return JSON.parse(this.fm.readFile('.' + this.fm.dirSep() + global.fileNames.setup));
};


/**
 * Save the provided object to the setup file on the current work dir as a json string
 */
exports.saveToSetupFile = function (object) {
  
    return this.fm.saveFile('.' + this.fm.dirSep() + global.fileNames.setup, JSON.stringify(object));
};