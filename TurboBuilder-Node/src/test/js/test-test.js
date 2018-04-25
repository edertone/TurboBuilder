#!/usr/bin/env node

'use strict';


/**
 * Test feature tests
 */


const utils = require('./index-utils.js');


utils.test("test-test", "Create and switch to the tests folder", function(){
    
    utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-test'));
});

utils.test("test-test", "When test is passed as the only one parameter, error happens", function(){
    
    utils.assertExecFails('-t', 'turbobuilder.json setup file not found', 'test should have failed if no project');  
    utils.assertExecContains('-g', "Failed -g argument", "Generated project structure ok");
    utils.assertExecFails('-t', '--test must be used at the same time as -b --build or -r --release', 'test should have failed if only parameter');
});