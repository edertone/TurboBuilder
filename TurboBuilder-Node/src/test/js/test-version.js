#!/usr/bin/env node

'use strict';


/**
 * Version feature tests
 */


require('./../../main/js/globals');
const utils = require('./index-utils');
const currentVersion = require(global.installationPaths.root + '/package.json').version;


// Create and switch to the tests folder
utils.assertFolderEmpty(utils.switchToDirInsideTemp('test-version'));


// When -v argument is passed, application version is shown
utils.assertExecContains('-v', currentVersion, "Failed showing help with -v");


// When --version argument is passed, application version is shown
utils.assertExecContains('--version', currentVersion, "Failed showing help with --version");


//When -v argument is passed after creating an empty project, application version is shown
utils.exec('-g');
utils.assertExecContains('-v', currentVersion, "Failed showing help with -v");


//When -version argument is passed after creating an empty project, application version is shown
utils.assertExecContains('--version', currentVersion, "Failed showing help with --version");