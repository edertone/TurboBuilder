#!/usr/bin/env node

'use strict';


/**
 * This is the main entry point for the turbobuilder command line application
 */


const program = require('commander');
const packageJson = require('../../../package.json');
const { StringUtils } = require('turbocommons-ts');


/**
 * This application uses the commander npm module to easily manage the command line args.
 * All cmd interface and options are defined here
 */
program
    .alias('tb')
    .version(packageJson.version, '-v, --version')
    .option('-b, --build', 'Perform the all the operations to generate the project files')
    .option('-t, --test', 'Execute all the defined tests')
    .option('-r, --release', 'Generate the production ready project version')
    .option('-p, --publish', 'Copy the project generated files to the specified locations')
    .parse(process.argv);


let anyOptionDefined = false;

if (program.build){
    
    anyOptionDefined = true;
    
    // TODO - Implement this feature on a sepparate js file
    console.log('build');
}

if (program.test){
    
    anyOptionDefined = true;
    
    // TODO - Implement this feature on a sepparate js file
    console.log('test');
}

if (program.release){
    
    anyOptionDefined = true;
    
    // TODO - Implement this feature on a sepparate js file
    console.log('release');
}

if (program.publish){
    
    anyOptionDefined = true;
    
    // TODO - Implement this feature on a sepparate js file
    console.log('publish');
}


//If no option was specified display the program help
if(!anyOptionDefined){
 
    program.help();
}