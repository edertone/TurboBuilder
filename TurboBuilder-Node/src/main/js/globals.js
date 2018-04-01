'use strict';

/**
 * this module defines all the global constants and variables that are used by the builder
 * and gives them default values.
 */


const path = require('path');


/**
 * The name for the main xml setup file that contains the builder configuration
 */
global.SETUP_FILE_NAME = 'turbobuilder.xml';

/**
 * Path where the builder main script has been called at execution time (via cmd)
 */
global.RUNTIME_PATH = './';

/**
 * Path to the project base folder
 */
global.ROOT_PATH = path.resolve(__dirname + '/../../../');

/**
 * Path to the project src folder
 */
global.SRC_PATH = path.resolve(global.ROOT_PATH + '/src/');

/**
 * Path to the project main resources folder
 */
global.MAIN_RESOURCES_PATH = path.resolve(global.ROOT_PATH + '/src/main/resources/');