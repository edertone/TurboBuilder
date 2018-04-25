#!/usr/bin/env node

'use strict';


/**
 * Generate feature tests
 */


require('./../../main/js/globals');
const utils = require('./index-utils');


utils.test("test-generate", "Create and switch to the generate folder", function(){

    utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-generate'));
});


utils.test("test-generate", "When -g argument is passed, application files are created", function(){
    
    utils.assertExecContains('-g', "Failed -g argument", "Generated project structure ok");
});

 
utils.test("test-generate", "When validation is called, it succeeds", function(){
    
    utils.assertExecContains('-l', "Failed validation", "validate ok");
});


utils.test("test-generate", "When -g argument is passed again, an error happens", function(){
    
    utils.assertExecFails('-g', 'File ' + global.fileNames.setup + ' already exists', "Failed verifying generate already happened");
});


utils.test("test-generate", "When -generate argument is passed, application files are created", function(){
    
    utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-generate-2'));
    utils.assertExecContains('--generate', "Failed -generate argument", "Generated project structure ok");
});


utils.test("test-generate", "When validation is called, it succeeds", function(){
    
    utils.assertExecContains('-l', "Failed validation", "validate ok");
});


utils.test("test-generate", "When -generate argument is passed again, an error happens", function(){
    
    utils.assertExecFails('--generate', 'File ' + global.fileNames.setup + ' already exists', "Failed verifying generate already happened");
});


utils.test("test-generate", "When -g is called on a non empty folder, error happens", function(){
    
    utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-generate-3'));
    // TODO - create some raw file to the test-generate-3 folder 
    // utils.assertExecFails('-g', 'Current folder is not empty! :' + global.runtimePaths.root, "-g Must fail on a non empty folder");
});


utils.test("test-generate", "When --generate is called on a non empty folder, error happens", function(){
    
    utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-generate-4'));
    // TODO - create some raw folder to the test-generate-4 folder 
    // utils.assertExecFails('--generate', 'Current folder is not empty! :' + global.runtimePaths.root, "--generate Must fail on a non empty folder");
});
