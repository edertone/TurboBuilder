#!/usr/bin/env node

'use strict';


/**
 * Build feature tests
 */


require('./../../main/js/globals');
const utils = require('./index-utils');


let workDir = utils.switchToDirInsideTemp('test-build');


utils.test("test-build", "Create and switch to the tests folder", function(){

    utils.assertFolderEmpty(workDir);
});


utils.test("test-build", "When -b argument is passed on empty folder, error is shown", function(){
    
    utils.assertExecFails('-b', global.fileNames.setup + ' setup file not found', 'build should have failed on empty dir');  
});


utils.test("test-build", "When --build argument is passed on empty folder, error is shown", function(){
    
    utils.assertExecFails('--build', global.fileNames.setup + ' setup file not found', 'build should have failed on empty dir');
});


utils.test("test-build", "When -b argument is passed after generating a project structure, build fails with no files to build", function(){
    
    utils.assertExecContains('-g', "Generated project structure ok", "Failed -g argument");
    utils.assertExecFails('-b', 'no files to build', 'build should have failed when no files to build');
});

utils.test("test-build", "When --build argument is passed after generating a project structure, build fails with no files to build", function(){
    
    utils.assertExecFails('--build', 'no files to build', 'build should have failed when no files to build');
});


utils.test("test-build", "When -b argument is passed after generating a project structure with some ts files, build succeeds", function(){
    
    // TODO - implement
    // TODO - set global.setupBuild.Ts.enabled to true
    //    utils.assertExecContains('-g', "Generated project structure ok", "Failed -g argument");
    //    utils.assertExecFails('-b', 'build ok', 'no files to build');
    //    utils.assertIsFolder(workDir + '/target');
    //    utils.assertIsFolder(workDir + '/target/test-build');
});