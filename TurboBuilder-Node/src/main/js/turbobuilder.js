#!/usr/bin/env node

'use strict';

/**
 * This is the main entry point for the turbobuilder command line application
 */


const program = require('commander');
const { StringUtils } = require('turbocommons-ts');
const globalsModule = require('./globals');
const console = require('./console');
const setupModule = require('./setup');
const generateModule = require('./generate');
const validateModule = require('./validate');
const buildModule = require('./build');
const releaseModule = require('./release');
const testModule = require('./test');
const cleanModule = require('./clean');


/**
 * This application uses the commander npm module to easily manage the command line args.
 * All cmd interface and options are defined here
 */
program
    .alias('tb')
    .version(setupModule.getVersionNumbers(), '-v, --version')
    .option('-g, --generate', 'Create a full project structure on the current directory')
    .option('-l, --lint', 'Perform project validation as configured in ' + global.fileNames.setup)
    .option('-c, --clean', 'Clear all the built files and delete ' + global.folderNames.target + ' folder')
    .option('-b, --build', 'Generate the project development version as configured in ' + global.fileNames.setup)
    .option('-t, --test', 'Execute all tests as configured in ' + global.fileNames.setup)
    .option('-r, --release', 'Generate the project production ready version as configured in ' + global.fileNames.setup)
    .option('-p, --publish', 'Copy or sync the project generated files to the locations configured in ' + global.fileNames.setup)
    .parse(process.argv);

// If none of the options have been passed, we will show the help
if(!program.generate &&
   !program.lint &&
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
    
    generateModule.execute();
    process.exit(0);
}

// Initialize the builder setup and global variables
setupModule.init();

// Perform the validation as defined on xml setup 
if (program.lint){
 
    validateModule.execute();
}

// Perform the project cleanup
if (program.clean){
 
    cleanModule.execute();
}

// Perform the build as defined on xml setup
if (program.build){
    
    buildModule.execute();
}

if (program.release){
    
    releaseModule.execute();
}

if (program.test){
    
    if (!program.build && !program.release){
    
        console.error('--test must be used at the same time as -b --build or -r --release');
    }
    
    testModule.execute(program.build, program.release);
}

if (program.publish){
    
    // TODO - Implement this feature on a sepparate js file
    console.success('publish');
}