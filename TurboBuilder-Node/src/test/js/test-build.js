#!/usr/bin/env node

'use strict';


/**
 * Build feature tests
 */


require('./../../main/js/globals');
const { FilesManager } = require('turbocommons-ts');
const utils = require('./index-utils');


let workDir = utils.switchToDirInsideTemp('test-build');
let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


utils.test("test-build", "Create and switch to the tests folder", function(){

    utils.assertFolderEmpty(workDir);
});


utils.test("test-build", "When -b argument is passed on empty folder, error is shown", function(){
    
    utils.assertExecFails('-b', global.fileNames.setup + ' setup file not found', 'build should have failed on empty dir');  
});


utils.test("test-build", "When --build argument is passed on empty folder, error is shown", function(){
    
    utils.assertExecFails('--build', global.fileNames.setup + ' setup file not found', 'build should have failed on empty dir');
});


utils.test("test-build", "When -b argument is passed after generating a project structure, build fails with no build type specified", function(){
    
    utils.assertExecContains('-g lib_ts', "Failed -g argument", "Generated project structure ok");
    utils.assertExecFails('-b', 'Please specify only one of the following on build setup', 'build should have failed when nothing is enabled on setup build');
});


utils.test("test-build", "When --build argument is passed after generating a project structure, build fails with no build type specified", function(){
    
    utils.assertExecFails('--build', 'Please specify only one of the following on build setup', 'build should have failed when nothing is enabled on setup build');
});


utils.test("test-build", "When -b argument is passed with empty setup build structure, build fails", function(){
    
    let setup = utils.readSetupFile(workDir);
    setup.build = {};
    utils.saveToSetupFile(workDir, setup);
    
    utils.assertExecFails('--build', 'Nothing to build. Please enable any of', 'build should have failed');
});


utils.test("test-build", "When -b --build argument is passed after defining multiple project types, build fails", function(){
    
    let setup = utils.readSetupFile(workDir);
    setup.build = {lib_ts: {}, lib_php: {}};
    utils.saveToSetupFile(workDir, setup);
    
    utils.assertExecFails('-b', 'Please specify only one of the following on build setup', 'build should have failed when nothing is enabled on setup build');
    utils.assertExecFails('--build', 'Please specify only one of the following on build setup', 'build should have failed when nothing is enabled on setup build');
});


utils.test("test-build", "When -b --build arguments are passed after enabling ts build with no ts files, build fails with no files to build", function(){
    
    let setup = utils.readSetupFile(workDir);
    setup.build = {lib_ts: {}};
    utils.saveToSetupFile(workDir, setup);
    
    // Delete the src ts folder
    fm.deleteDirectory(workDir + fm.dirSep() + 'src' + fm.dirSep() + 'main' + fm.dirSep() + 'ts', false);
    
    utils.assertExecFails('-b', 'no files to build', 'build should have failed when no files to build');
    utils.assertExecFails('--build', 'no files to build', 'build should have failed when no files to build');
});


utils.test("test-build", "When -b argument is passed after generating a project structure with some ts files, build succeeds", function(){
    
    utils.assertSaveFile(workDir + '/src/main/ts/index.ts', '');
    utils.assertExecContains('-b', 'failed -b argument', 'build ok');
    
    utils.assertIsFile(workDir + '/target/test-build/dist/es5/PackedJsFileName-ES5.js');
    utils.assertIsFile(workDir + '/target/test-build/dist/es6/PackedJsFileName-ES6.js');       
    utils.assertIsFile(workDir + '/target/test-build/dist/ts/index.js');       
});


utils.test("test-build", "When -b argument is passed after generating a project structure with some php files, creating phar file succeeds", function(){
    
    let testDir = utils.switchToDirInsideTemp('test-build-1');
    
    utils.assertExecContains('-g lib_php', "Failed -g argument", "Generated project structure ok");
    
    let setup = utils.readSetupFile(testDir);
    
    setup.build = {lib_php: {}};
    
    utils.saveToSetupFile(testDir, setup);
    
    utils.assertSaveFile(testDir + '/src/main/php/AutoLoader.php', '<?php ?>');
    
    utils.assertExecContains('-b', 'failed -b argument', 'build ok');
    
    utils.assertIsFile(testDir + '/target/test-build-1/dist/test-build-1-0.0.0.phar');  
});