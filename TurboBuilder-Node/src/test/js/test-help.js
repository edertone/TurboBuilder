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
    
    utils.assertExecContains('-h', "Failed -h argument", "Usage: turbobuilder|tb [options]");
});


utils.test("test-help", "When -help argument is passed, application help is shown", function(){
    
    utils.assertExecContains('--help', "Failed -help argument", "Usage: turbobuilder|tb [options]");
});


utils.test("test-help", "When launched without args on the empty tests folder, help info is shown", function(){
    
    utils.assertExecContains('', "Failed without arguments", "Usage: turbobuilder|tb [options]");
});


utils.test("test-help", "When -h argument is passed after creating an empty project, application version is shown", function(){
    
    utils.exec('-g');
    utils.assertExecContains('-h', "Failed showing help", "Usage: turbobuilder|tb [options]");
});


utils.test("test-help", "When -help argument is passed after creating an empty project, application version is shown", function(){
    
    utils.assertExecContains('--help', "Failed showing help", "Usage: turbobuilder|tb [options]");
});


utils.test("test-help", "When launched without args after creating an empty project, application version is shown", function(){
    
    utils.assertExecContains('', "Failed showing help", "Usage: turbobuilder|tb [options]");
});