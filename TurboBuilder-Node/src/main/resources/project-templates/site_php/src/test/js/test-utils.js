#!/usr/bin/env node

'use strict';


/**
 * Methods that help with performing the tests
 */

try {
    
    // Test that node_modules is installed by checking one of the custom modules (turbocommons)
    require.resolve("turbocommons-ts");
    
} catch(e) {
    
    console.log('\x1b[31m%s\x1b[0m', "Error: turbocommons-ts module not found. Did you run npm install?");
    process.exit(1);
}

const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');


/**
 * Execute an arbitrary cmd command on the current active dir
 */
exports.checkChromeDriverAvailable = function () {
    
    try{
        
        let chromedriverCmd = execSync('chromedriver -v', {stdio : 'pipe'}).toString();
                
    }catch(e){
        
        utils.consoleErrorAndDie("Error: Could not initialize selenium chromedriver. Please make sure it is available on OS path");
    }
}


/**
 * Execute an arbitrary cmd command on the current active dir
 */
exports.execCmdCommand = function (cmdLine) {
    
    try{
        
        return execSync(cmdLine, {stdio : 'pipe'}).toString();
        
    }catch(e){
        
        if(!StringUtils.isEmpty(e.stderr.toString())){
            
            return e.stderr.toString();
        }
        
        return e.stdout.toString();
    }  
}


/**
 * Show an error message and terminate the current application with error
 */
exports.consoleErrorAndDie = function (msg) {
    
    console.log('\x1b[31m%s\x1b[0m', msg);
    process.exit(1);
}