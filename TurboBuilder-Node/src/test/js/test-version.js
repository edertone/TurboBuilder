#!/usr/bin/env node

'use strict';


/**
 * Version feature tests
 */


require('./../../main/js/globals');
const utils = require('./index-utils');
const currentVersion = require(global.installationPaths.root + '/package.json').version;


utils.test("test-version", "Create and switch to the tests folder", function(){
    
    utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-version'));    
});


utils.test("test-version", "When -v argument is passed, application version is shown", function(){
    
    utils.assertExecContains('-v', "Failed showing help with -v", currentVersion);
});


utils.test("test-version", "When --version argument is passed, application version is shown", function(){
  
    utils.assertExecContains('--version', "Failed showing help with --version", currentVersion);
});


utils.test("test-version", "When -v argument is passed after creating an empty project, application version is shown", function(){
    
    utils.exec('-g');
    utils.assertExecContains('-v', "Failed showing help with -v", currentVersion);
});


utils.test("test-version", "When -version argument is passed after creating an empty project, application version is shown", function(){
    
    utils.assertExecContains('--version', "Failed showing help with --version", currentVersion);
});