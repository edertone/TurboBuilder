#!/usr/bin/env node

'use strict';


/**
 * Version feature tests
 */


require('./../../main/js/globals');
const utils = require('./index-utils');


let workDir = utils.switchToDirInsideTemp('test-validate');


utils.test("test-validate", "Create and switch to the tests folder", function(){

    utils.assertFolderEmpty(workDir);
});


utils.test("test-validate", "Generate new project and launch validation", function(){
    
    utils.assertExecContains('-g', "Failed -g argument", "Generated project structure ok");
    utils.assertExecContains('-l', "Failed validation", "validate ok");
});


utils.test("test-validate", "Validation is executed before build by default and fails with default config", function(){
    
    utils.assertExecFails('-b', "Nothing to build.", "Build should have failed with default setup values");
});


utils.test("test-validate", "Validation is executed before build by default when build works as expected", function(){
    
    utils.saveToSetupFile(workDir, {build: {ts: {enabled: true}}});
    
    utils.assertSaveFile(workDir + '/src/main/ts/index.ts', '');
    
    utils.assertExecContains('-b', "Failed validation", ["validate ok", "build ok"]);
});


utils.test("test-validate", "Validation is not executed before build by default when disabled in config", function(){
    
    utils.saveToSetupFile(workDir, {build: {ts: {enabled: true}}, validate: {runBeforeBuild: false}});
    
    utils.assertExecContains('-b', "Failed validation", ["build ok"], ["validate ok"]);
});


utils.test("test-validate", "modify project config to verify copyright headers, add some files with correct headers and launch validation", function(){
//  TODO  
//    utils.saveToSetupFile(workDir, {validate: {runBeforeBuild: true}});
//    
//    utils.assertExecContains('-l', "Failed validation", "validate ok");
});


utils.test("test-validate", "modify project config to verify copyright headers, add some files with INCORRECT headers and launch validation", function(){
//  TODO  
//    utils.saveToSetupFile(workDir, {validate: {runBeforeBuild: true}});
//    
//    utils.assertExecContains('-l', "Failed validation", "validate ok");
});