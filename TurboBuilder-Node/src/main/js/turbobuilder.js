#!/usr/bin/env node

'use strict';

/**
 * This is the main entry point for the turbobuilder command line application
 */


const { StringUtils } = require('turbocommons-ts');
const globalsModule = require('./globals');
const packageJson = require(global.ROOT_PATH + '/package.json');
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
    .version(packageJson.version, '-v, --version')
    .option('-c, --create', 'Create a full project structure on the current directory')
    .option('-l, --validate', 'Perform project validation as configured in ' + global.SETUP_FILE_NAME)
    .option('-b, --build', 'Execute the build process as configured in ' + global.SETUP_FILE_NAME)
    .option('-t, --test', 'Execute all tests as configured in ' + global.SETUP_FILE_NAME)
    .option('-r, --release', 'Generate the project production ready version as configured in ' + global.SETUP_FILE_NAME)
    .option('-p, --publish', 'Copy the project generated files to the specified locations')
    .parse(process.argv);

// If none of the options have been passed, we will show the help
if(!program.create &&
   !program.validate &&
   !program.build &&
   !program.test &&
   !program.release &&
   !program.publish){
    
    program.help();
    process.exit(0);
}

// Generate the default setup xml file if necessary
if (program.create){
    
    setupModule.createSetup();    
    process.exit(0);
}

//Initialize the builder setup and global variables
setupModule.init();

//Perform the validation as defined on xml setup 
if (program.validate){
 
 validateModule.execute();
}

// Perform the build as defined on xml setup
if (program.build){
    
    buildModule.execute();
}

if (program.test){
    
    // TODO - Implement this feature on a sepparate js file
    console.log('test');
}

if (program.release){
    
    // TODO - Implement this feature on a sepparate js file
    console.log('release');
}

if (program.publish){
    
    // TODO - Implement this feature on a sepparate js file
    console.log('publish');
}