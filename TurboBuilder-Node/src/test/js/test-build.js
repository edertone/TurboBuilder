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


utils.test("test-build", "When -b argument is passed after generating a project structure, build fails with nothing to build", function(){
    
    utils.assertExecContains('-g', "Failed -g argument", "Generated project structure ok");
    utils.assertExecFails('-b', 'Nothing to build. Please enable ', 'build should have failed when nothing is enabled on setup build');
});


utils.test("test-build", "When --build argument is passed after generating a project structure, build fails with nothing to build", function(){
    
    utils.assertExecFails('--build', 'Nothing to build. Please enable ', 'build should have failed when nothing is enabled on setup build');
});


utils.test("test-build", "When -b --build arguments are passed after enabling ts build with no ts files, build fails with no files to build", function(){
    
    let setup = utils.readSetupFile(workDir);
    
    setup.build.ts.enabled = true;
    
    utils.saveToSetupFile(workDir, setup);
    
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
    
    utils.assertExecContains('-g', "Failed -g argument", "Generated project structure ok");
    
    let setup = utils.readSetupFile(testDir);
    
    setup.build.php.enabled = true;
    
    utils.saveToSetupFile(testDir, setup);
    
    utils.assertSaveFile(testDir + '/src/main/php/AutoLoader.php', '<?php ?>');
    
    utils.assertExecContains('-b', 'failed -b argument', 'build ok');
    
    utils.assertIsFile(testDir + '/target/test-build-1/dist/test-build-1.phar');  
});