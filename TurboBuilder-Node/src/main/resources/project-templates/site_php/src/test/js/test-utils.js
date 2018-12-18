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

const path = require('path');
const { execSync } = require('child_process');
const { StringUtils, FilesManager } = require('turbocommons-ts');
const fm = new FilesManager(require('fs'), require('os'), path, process);


/**
 * Check that chrome driver is available to use
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


/**
 * Replaces all wildcards on a provided url with the turbosite setup values
 */
exports.replaceWildCardsOnText = function (text) {
    
    let rootSetup = JSON.parse(fm.readFile('turbobuilder.json'));
    
    let projectName = rootSetup.metadata.name;
    
    // TODO - aqui el project name falla si estem testejant un release    
    this.siteSetup = JSON.parse(fm.readFile('target/' + projectName + '/dist/site/turbosite.json'));
    
    return StringUtils.replace(text,
            ['$host', '$locale', '$homeView', '$cacheHash', '$baseURL'],
            [this.siteSetup.remoteUrl.split('://')[1],
             this.siteSetup.locales[0].split('_')[0],
             this.siteSetup.homeView,
             this.siteSetup.cacheHash,
             this.siteSetup.baseURL === '' ? '' : '/' + this.siteSetup.baseURL]);
}