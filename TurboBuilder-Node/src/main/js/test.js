'use strict';

/**
 * this module contains all the code related to the test process
 */


const { FilesManager } = require('turbocommons-ts');
const { spawn } = require('child_process');
const console = require('./console');
const buildModule = require('./build');
const opn = require('opn');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process); 


/**
 * Execute the typescript tests
 */
let testTypeScript = function (destPath) {
    
    console.log("\nlaunching ts tests");
    
    if(!global.setupBuild.Ts.enabled){
        
        console.error('<Build><Ts enabled="true"> is mandatory on ' + global.fileNames.setup + ' to run typescript tests');
    }
    
    //Define folders
    let sep = fm.dirSep();
    let destTestsPath = destPath + sep + 'test';
    let srcTestsPath = global.runtimePaths.test + sep + 'ts';
    
    fm.createDirectory(destTestsPath, true);
    
    // Initialize an http server as an independent terminal instance, with the dest folder as the http root
    spawn(global.installationPaths.httpServerBin + ' "' + destTestsPath + '" -c-1', [],
            {shell: true, stdio: 'ignore', detached: true}).unref();
    
    console.success('started http-server');
    
    // Generate all the files to launch the tests
    for (let targetObject of global.setupBuild.Ts.CompilerTarget) {
        
        let target = targetObject.target;
        let testsTarget = destTestsPath + sep + target;
        
        // Create current target folder
        if(!fm.createDirectory(testsTarget, true)){
            
            console.error('Could not create ' + testsTarget);
        }
        
        // Merge all tests code into tests target
        fm.mergeFiles(fm.findDirectoryItems(srcTestsPath, /.*\.js$/i, 'absolute', 'files'),
                testsTarget + sep + 'tests.js', "\n\n");

        // Copy all test resources
        fm.createDirectory(testsTarget + sep + 'resources');
        fm.copyDirectory(srcTestsPath + sep + 'resources', testsTarget + sep + 'resources');
        
        // Merge all src dist code into tests target
        fm.mergeFiles(fm.findDirectoryItems(destPath + sep + 'dist' + sep + target, /.*\.js$/i, 'absolute', 'files'),
                testsTarget + sep + 'build.js', "\n\n");

        // Copy qunit library
        if(!fm.copyDirectory(global.installationPaths.testResources + sep + 'libs' + sep + 'qunit', testsTarget, false)){
            
            console.error('Could not copy qunit library');
        }
    
        // Generate index.html if not exists
        if(fm.isFile(srcTestsPath + sep + 'index.html')){
            
            // TODO - copy index.html to target
            
        }else{
            
            let htmlIndexCode = '<!DOCTYPE html>';            
            htmlIndexCode += '<html>';
            htmlIndexCode += '<head>';
            htmlIndexCode += '<meta charset="utf-8">';
            htmlIndexCode += '<meta name="viewport" content="width=device-width">';
            htmlIndexCode += '<title>Tests results</title>';
            htmlIndexCode += '<link rel="stylesheet" href="qunit-2.6.0.css">';
            htmlIndexCode += '</head>';
            htmlIndexCode += '<body>';
            htmlIndexCode += '<div id="qunit"></div>';
            htmlIndexCode += '<div id="qunit-fixture"></div>';
            htmlIndexCode += '<script src="qunit-2.6.0.js"></script>';
            htmlIndexCode += '<script src="build.js"></script>';
            htmlIndexCode += '<script src="tests.js"></script>';
            htmlIndexCode += '</body>';
            htmlIndexCode += '</html>';
            
            if(!fm.createFile(testsTarget + sep + 'index.html', htmlIndexCode)){
                
                console.error('Could not create ' + testsTarget + sep + 'index.html');
            }
        }
        
        // Run tests on all configured browsers
        opn('http://localhost:8080/' + target, {wait: false, app: ['chrome']});
    }
    
    console.success('done');
}


/**
 * Execute the test process
 */
exports.execute = function () {
    
    if(global.setupTest.Ts.enabled){
        
        testTypeScript([global.runtimePaths.targetProjectName]);
    }
};