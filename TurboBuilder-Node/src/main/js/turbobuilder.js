#!/usr/bin/env node

'use strict';


/**
 * This is the main entry point for the turbobuilder command line application
 */


// define global constants
global.SETUP_FILE_NAME = 'turbobuilder.xml';


// Import all required modules
const { StringUtils } = require('turbocommons-ts');
const program = require('commander');
const packageJson = require('../../../package.json');
const setup = require('./setup');
const build = require('./build');


// Initialize global variables
global.loadedSetup = setup.loadSetupFromXml();
global.latestGitTag = setup.getLatestGitTag();


/**
 * This application uses the commander npm module to easily manage the command line args.
 * All cmd interface and options are defined here
 */
program
    .alias('tb')
    .version(packageJson.version, '-v, --version')
    .option('-u, --validate', 'Performs project validation as defined in turbobuilder.xml')
    .option('-t, --test', 'Execute all the defined tests')
    .option('-r, --release', 'Generate the production ready project version')
    .option('-p, --publish', 'Copy the project generated files to the specified locations')
    .parse(process.argv);


// Perform the build as defined on xml setup
build.execute();

if (program.validate){
    
    // TODO - Implement this feature on a sepparate js file
    console.log('validate');
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