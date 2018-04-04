#!/usr/bin/env node

'use strict';

/**
 * This is the main entry point for the turbobuilder command line application
 */


const { StringUtils } = require('turbocommons-ts');
const globalsModule = require('./globals');
const consoleModule = require('./console');
const setupModule = require('./setup');
const validateModule = require('./validate');
const buildModule = require('./build');
const program = require('commander');


/**
 * This application uses the commander npm module to easily manage the command line args.
 * All cmd interface and options are defined here
 */
program
    .alias('tb')
    .version(require(global.installationPaths.root + '/package.json').version, '-v, --version')
    .option('-g, --generate', 'Create a full project structure on the current directory')
    .option('-l, --validate', 'Perform project validation as configured in ' + global.fileNames.setup)
    .option('-c, --clean', 'Clear all the built files and delete ' + global.folderNames.target + ' folder')
    .option('-b, --build', 'Execute the build process as configured in ' + global.fileNames.setup)
    .option('-t, --test', 'Execute all tests as configured in ' + global.fileNames.setup)
    .option('-r, --release', 'Generate the project production ready version as configured in ' + global.fileNames.setup)
    .option('-p, --publish', 'Copy the project generated files to the specified locations')
    .parse(process.argv);

// If none of the options have been passed, we will show the help
if(!program.generate &&
   !program.validate &&
   !program.clean &&
   !program.build &&
   !program.test &&
   !program.release &&
   !program.publish){
    
    program.help();
    process.exit(0);
}

// Generate the default project files if necessary
if (program.generate){
    
    setupModule.createSetup();  
    buildModule.createProjectStructure();
    process.exit(0);
}

// Initialize the builder setup and global variables
setupModule.init();

// Perform the validation as defined on xml setup 
if (program.validate){
 
    validateModule.execute();
}

// TODO
if (program.clean){
 
    cleanModule.execute();
}

// Perform the build as defined on xml setup
if (program.build){
    
    //validateModule.execute();
    buildModule.execute();
}

if (program.test){
    
    // TODO - Implement this feature on a sepparate js file
    consoleModule.success('test');
}

if (program.release){
    
    // TODO - Implement this feature on a sepparate js file
    consoleModule.success('release');
}

if (program.publish){
    
    // TODO - Implement this feature on a sepparate js file
    consoleModule.success('publish');
}