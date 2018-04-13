#!/usr/bin/env node

'use strict';


/**
 * Build feature tests
 */


require('./../../main/js/globals');
const utils = require('./index-utils');


// Create and switch to the tests folder
let workDir = utils.switchToDirInsideTemp('test-build');
utils.assertFolderEmpty(workDir);


// When -b argument is passed on empty folder, error is shown
utils.assertExecFails('-b', global.fileNames.setup + ' setup file not found', 'build should have failed on empty dir');


// When --build argument is passed on empty folder, error is shown
utils.assertExecFails('--build', global.fileNames.setup + ' setup file not found', 'build should have failed on empty dir');


// When -b argument is passed after generating a project structure, build completes and target folders are created
utils.assertExecContains('-g', "Generated project structure ok", "Failed -g argument");
utils.assertExecContains('-b', 'build ok', 'failed build on generated project');
utils.assertIsFolder(workDir + '/target');
utils.assertIsFolder(workDir + '/target/test-build');