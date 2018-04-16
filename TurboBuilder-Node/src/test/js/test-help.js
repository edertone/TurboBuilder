#!/usr/bin/env node

'use strict';


/**
 * Help feature tests
 */


const utils = require('./index-utils.js');


utils.test("test-help", "Create and switch to the tests folder", function(){
    
    utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-help'));
});


utils.test("test-help", "When -h argument is passed, application help is shown", function(){
    
    utils.assertExecContains('-h', "Usage: turbobuilder|tb [options]", "Failed -h argument");
});


utils.test("test-help", "When -help argument is passed, application help is shown", function(){
    
    utils.assertExecContains('--help', "Usage: turbobuilder|tb [options]", "Failed -help argument");
});


utils.test("test-help", "When launched without args on the empty tests folder, help info is shown", function(){
    
    utils.assertExecContains('', "Usage: turbobuilder|tb [options]", "Failed without arguments");
});


utils.test("test-help", "When -h argument is passed after creating an empty project, application version is shown", function(){
    
    utils.exec('-g');
    utils.assertExecContains('-h', "Usage: turbobuilder|tb [options]", "Failed showing help");
});


utils.test("test-help", "When -help argument is passed after creating an empty project, application version is shown", function(){
    
    utils.assertExecContains('--help', "Usage: turbobuilder|tb [options]", "Failed showing help");
});


utils.test("test-help", "When launched without args after creating an empty project, application version is shown", function(){
    
    utils.assertExecContains('', "Usage: turbobuilder|tb [options]", "Failed showing help");
});