#!/usr/bin/env node

'use strict';


/**
 * Methods that help with performing the tests
 */

require('./../../main/js/globals');
const path = require('path');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');

 
const terminalManager = new TerminalManager();

/**
 * A files manager object ready to be used by the tests
 */
exports.fm = new FilesManager();


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
    
    let pathToExecutable = 'node "' + path.resolve(__dirname + '/../../main/js/turbobuilder.js') + '"';
    
    return terminalManager.exec(pathToExecutable + ' ' + options).output;
};


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