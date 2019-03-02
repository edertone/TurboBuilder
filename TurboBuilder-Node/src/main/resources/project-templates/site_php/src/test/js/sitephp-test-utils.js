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
const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');

const fm = new FilesManager(require('fs'), require('os'), path, process);


/**
 * Check that chrome driver is available to use
 */
exports.checkChromeDriverAvailable = function () {
    
    try{
        
        execSync('chromedriver -v', {stdio : 'pipe'}).toString();
                
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
    
    // TODO - Projectname fails here if we are testing a release compiled version
    let projectName = (rootSetup.metadata.name === '') ?
        StringUtils.getPathElement(path.resolve('./')) :
        rootSetup.metadata.name;
    
    let siteSetup = this.getTurbositeSetupFromIndexPhp('target/' + projectName + '/dist/site/index.php');
    
    let turboBuilderSetup = JSON.parse(fm.readFile('turbobuilder.json'));
    
    return StringUtils.replace(text,
            ['$host', '$locale', '$homeView', '$cacheHash', '$baseURL'],
            [turboBuilderSetup.sync.remoteUrl.split('://')[1],
             siteSetup.locales[0].split('_')[0],
             siteSetup.homeView,
             siteSetup.cacheHash,
             siteSetup.baseURL === '' ? '' : '/' + siteSetup.baseURL]);
}


/**
 * This method is used for tests related to the turbosite projects.
 * It extracts the turbosite setup data (as a javascript object) from a provided index.php file path
 */
exports.getTurbositeSetupFromIndexPhp = function (indexPhpPath) {
    
    let setupJson = fm.readFile(indexPhpPath).split('"turbosite.json" => json_decode(\'{')[1].split("}')")[0];

    setupJson = setupJson.replace(/\\'/g, "'").replace(/\\\\/g, "\\");

    return JSON.parse('{' + setupJson + '}');    
}


/**
 * This method is used for tests related to the turbosite projects and also by turbobuilder on some of its features.
 * It saves the specified setup data object into the specified index.php file.
 * If the setup json string already exists on the index.php file, it will be overriden, otherwise a new line will be
 * added to the index.php file containing the provided setup data.
 */
exports.saveSetupToIndexPhp = function (setupObject, setupName, indexPhpPath) {
    
    let indexPhpContent = fm.readFile(indexPhpPath);
    let indexPhpContentModified = '';
    let setupJson = JSON.stringify(setupObject).replace(/'/g, "\\'").replace(/\\/g, "\\\\");
        
    if(indexPhpContent.includes('$ws->generateContent(__FILE__);')){
    
        indexPhpContentModified = indexPhpContent
            .replace('$ws->generateContent(__FILE__);', 
                     '$ws->generateContent(__FILE__, [\n    "' + setupName + '.json" => json_decode(\'' + setupJson + "')\n]);");
    
    } else if(indexPhpContent.includes('"' + setupName + '.json" => json_decode(')) {

        indexPhpContentModified = indexPhpContent
            .replace(new RegExp('"' + setupName + "\\.json\" => json_decode\\('{.*}'\\)", 'g'),
                     '"turbosite.json" => json_decode(\'' + setupJson + '\')'); 
    
    } else {
    
        indexPhpContentModified = indexPhpContent
            .replace('$ws->generateContent(__FILE__, [\n',
                     '$ws->generateContent(__FILE__, [\n    "' + setupName + '.json" => json_decode(\'' + setupJson + "'),\n");
    }
    
    return fm.saveFile(indexPhpPath, indexPhpContentModified);    
}