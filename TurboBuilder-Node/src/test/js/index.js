#!/usr/bin/env node

'use strict';


/**
 * This script launches the tests for the turbobuilder project
 * Run it with : node src/test/js/index.js
 */


const { execSync } = require('child_process');
let os = require('os');

const pathToExecutable = '"' + __dirname + '/../../main/js/turbobuilder.js"';

console.log(os.tmpdir());

// when_launched_without_parameters_on_nonexistant_project_then_help_is_shown   
process.chdir(__dirname + '/../resources/nonexistant-project');

let exec = execSync('node ' + pathToExecutable, {stdio : 'pipe'});

if(exec.toString().indexOf("Usage: turbobuilder|tb [options]") < 0){

    console.log("Failed showing help");
    console.log(exec.toString());
}