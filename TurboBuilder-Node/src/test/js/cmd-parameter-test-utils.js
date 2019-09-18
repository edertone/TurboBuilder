#!/usr/bin/env node

'use strict';


/**
 * Methods that help with performing the tests
 */

const { FilesManager } = require('turbodepot-node');


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
  
    expect(testsGlobalHelper.execTbCmd('-g ' + projectType)).toContain("Generated project structure ok");
        
    let setup = testsGlobalHelper.readSetupFile();
    
    if(build !== null){
        
        setup.build = build;
    }
    
    if(copyPasteDetect !== null){
        
        setup.validate.filesContent.copyPasteDetect = copyPasteDetect;
    }
    
    expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
    
    return setup;
};