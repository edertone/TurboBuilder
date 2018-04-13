#!/usr/bin/env node

'use strict';


/**
 * Generate feature tests
 */


require('./../../main/js/globals');
const utils = require('./index-utils');


// Create and switch to the generate folder
utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-generate'));


// When -g argument is passed, application files are created
utils.assertExecContains('-g', "Generated project structure ok", "Failed -g argument");

// When validation is called, it succeeds
utils.assertExecContains('-l', "validate ok", "Failed validation");

//When -g argument is passed again, an error happens
utils.assertExecFails('-g', 'File ' + global.fileNames.setup + ' already exists', "Failed verifying generate already happened");

// When -generate argument is passed, application files are created
utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-generate-2'));
utils.assertExecContains('--generate', "Generated project structure ok", "Failed -generate argument");

//When validation is called, it succeeds
utils.assertExecContains('-l', "validate ok", "Failed validation");

//When -generate argument is passed again, an error happens
utils.assertExecFails('--generate', 'File ' + global.fileNames.setup + ' already exists', "Failed verifying generate already happened");

//When -g is called on a non empty folder, error happens
utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-generate-3'));
// TODO - create some raw file to the test-generate-3 folder 
// utils.assertExecFails('-g', 'Current folder is not empty! :' + global.runtimePaths.root, "-g Must fail on a non empty folder");

//When --generate is called on a non empty folder, error happens
utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-generate-4'));
// TODO - create some raw folder to the test-generate-4 folder 
// utils.assertExecFails('--generate', 'Current folder is not empty! :' + global.runtimePaths.root, "--generate Must fail on a non empty folder");
