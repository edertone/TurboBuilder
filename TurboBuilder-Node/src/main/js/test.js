'use strict';

/**
 * this module contains all the code related to the test process
 */


require('./globals');

const { ArrayUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { ConsoleManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');
const { spawn } = require('child_process');
const setupModule = require('./setup');
const releaseModule = require('./release');
const opn = require('opn');


const fm = new FilesManager(); 
const cm = new ConsoleManager();
const terminalManager = new TerminalManager();


/**
 * Execute the test process
 */
exports.execute = function () {
    
    cm.text("\ntest start");
    
    if(!ArrayUtils.isArray(global.setup.test.enabledTests) || global.setup.test.enabledTests.length <= 0){
        
        cm.warning("Nothing to test. Please setup some tests on test section in " + global.fileNames.setup);
    }
    
    // Check which build paths must be tested
    let pathsToTest = [];
    
    if(global.isRelease){
        
        pathsToTest.push(releaseModule.getReleaseRelativePath());
        
    } else {
        
        pathsToTest.push(setupModule.getProjectName());
    }
    
    for (let testSetup of global.setup.test.enabledTests) {
        
        if(testSetup.type === 'phpUnit'){
            
            executePhpUnitTests(testSetup, pathsToTest);
        }
        
        if(testSetup.type === 'jasmine'){
            
            executeJasmineTests(testSetup, pathsToTest);
        }
        
        if(testSetup.type === 'qunit'){
            
            executeQUnitTests(testSetup, pathsToTest);
        }
    }
    
    cm.success('test done');
};


/**
 * Initiate an http server instance using the project target folder as the root.
 * If a server is already using the currently configured port, the new instance will not start.
 * This is useful cause we will be able to leave the created http server instance open all the time
 * while we perform different test executions
 */
let launchHttpServer = function (root, port) {
    
    // Initialize an http server as an independent terminal instance, with the dest folder as the http root
    // and with the cache disabled. It will silently fail if a server is already listening the configured port
    let httpServerCmd = global.installationPaths.httpServerBin;
    
    httpServerCmd += ' "' + root + '"';
    httpServerCmd += ' -c-1';
    httpServerCmd += ' -p ' + port;
    
    spawn(httpServerCmd, [], {shell: true, stdio: 'ignore', detached: true}).unref();    
   
    cm.success('started http-server');
}


/**
 * Execute the PhpUnit tests
 * 
 * @param testSetup An object with the test setup
 * @param relativeBuildPaths A list with paths relative to project target folder,
 *        where tests folder and files will be created and executed
 */
let executePhpUnitTests = function (testSetup, relativeBuildPaths) {

    if(!global.setup.build.lib_php){
        
        cm.error('build.lib_php is mandatory on ' + global.fileNames.setup + ' to run php tests');
    }
    
    let sep = fm.dirSep();
    
    for (let relativeBuildPath of relativeBuildPaths) {
    
        let destPath = global.runtimePaths.target + sep + relativeBuildPath;
        let destTestsPath = destPath + sep + 'test';
        let coverageReportPath = destPath + sep + 'reports'  + sep + 'coverage' + sep + 'php';
        
        fm.createDirectory(destTestsPath, true);
        
        // Verify testsRoot value is correct
        if(!fm.isDirectory(global.runtimePaths.root + sep + testSetup.testsRoot + sep + 'php')){
                    
            cm.error('testsRoot setup value (' + testSetup.testsRoot + ') is incorrect on ' + global.fileNames.setup);            
        }
        
        // Copy all tests source code
        fm.copyDirectory(global.runtimePaths.root + sep + testSetup.testsRoot, destTestsPath);
        
        // Verify Php unit setup exists on target for tests
        let phpUnitSetupPath = destTestsPath + sep + 'php' + sep + 'PhpUnitSetup.xml';
        
        if(!fm.isFile(phpUnitSetupPath)){
                    
            cm.error('Php setup file not found on target for tests:\n' + phpUnitSetupPath);            
        }
        
        cm.success("launching phpunit tests at:");
        cm.success(destTestsPath);
        
        // Launch unit tests via php executable
        let phpExecCommand = 'php';
        
        phpExecCommand += ' "' + global.installationPaths.test + sep + 'libs' + sep + 'phpunit-7.5.15.phar"';
        
        if(testSetup.coverageReport){
            
            cm.warning("Warning: Enabling Php coverage report in unit tests is many times slower");
            
            phpExecCommand += ' --coverage-html "' + coverageReportPath + '"';                           
        }
                
        phpExecCommand += ' --configuration "' + phpUnitSetupPath + '"';     
        phpExecCommand += ' "' + destPath + '/"';
        
        let testsResult = terminalManager.exec(phpExecCommand, true);
        
        if(testsResult.failed){
    
            cm.error('There are PHP unit test failures\n\n' + testsResult.output);
        }
        
        // Open the coverage report if necessary
        if(testSetup.coverageReport && testSetup.coverageReportOpenAfterTests){
        
            // opn is a node module that opens resources in a cross OS manner
            opn(coverageReportPath + sep + 'index.html', {wait: false});
        }           
    }
}


/**
 * Execute the jasmine tests
 * 
 * @param testSetup An object with the test setup
 * @param relativeBuildPaths A list with paths relative to project target folder,
 *        where tests folder and files will be created and executed
 */
let executeJasmineTests = function (testSetup, relativeBuildPaths) {
    
    cm.success("launching jasmine tests");
    
    if(!fm.isFile(global.runtimePaths.root + fm.dirSep() + testSetup.jasmineConfig)){
        
        cm.error('Could not find jasmine config file at:\n' + global.runtimePaths.root + fm.dirSep() + testSetup.jasmineConfig + '\nPlease setup a jasmine.json file there so jasmine tests can be executed!');
    }

    let jasmineExecCommand = global.installationPaths.jasmineBin + ' --config=' + testSetup.jasmineConfig;
    
    if(terminalManager.exec(jasmineExecCommand, true).failed){
        
        cm.error('There are jasmine unit test failures');
    } 
}


/**
 * Execute the QUNIT tests
 * 
 * @param testSetup An object with the test setup
 * @param relativeBuildPaths A list with paths relative to project target folder,
 *        where tests folder and files will be created and executed
 */
let executeQUnitTests = function (testSetup, relativeBuildPaths) {
    
    if(!global.setup.build.lib_ts){
        
        cm.error('build.lib_ts is mandatory on ' + global.fileNames.setup + ' to run qunit tests');
    }
    
    cm.success("launching qunit tests");
    
    let sep = fm.dirSep();
    let srcTestsPath = global.runtimePaths.root + sep + testSetup.testsRoot;
    
    launchHttpServer(global.runtimePaths.target, testSetup.httpServerPort);
    
    for (let relativeBuildPath of relativeBuildPaths) {
        
        let destPath = global.runtimePaths.target + sep + relativeBuildPath;
        let destTestsPath = destPath + sep + 'test';
        
        fm.createDirectory(destTestsPath, true);
        
        // Verify testsRoot value is correct
        if(!fm.isDirectory(global.runtimePaths.root + sep + testSetup.testsRoot + sep + 'js')){
                    
            cm.error('testsRoot setup value (' + testSetup.testsRoot + ') is incorrect on ' + global.fileNames.setup);            
        }
        
        // Generate all the files to launch the tests
        for (let tsTargetObject of global.setup.build.lib_ts.targets) {
            
            if(testSetup.targets.indexOf(tsTargetObject.folder) >= 0){
                
                let testsTarget = destTestsPath + sep + tsTargetObject.folder;
                
                if(!fm.createDirectory(testsTarget, true)){
                    
                    cm.error('Could not create ' + testsTarget);
                }
                
                // Merge all tests code into tests target
                fm.mergeFiles(fm.findDirectoryItems(srcTestsPath, /.*\.js$/i, 'absolute', 'files'),
                        testsTarget + sep + 'tests.js', "\n\n");
        
                // Copy all test resources
                fm.createDirectory(testsTarget + sep + 'resources');
                fm.copyDirectory(srcTestsPath + sep + 'resources', testsTarget + sep + 'resources');
                
                // Merge all src dist code into tests target
                fm.mergeFiles(fm.findDirectoryItems(destPath + sep + 'dist' + sep + tsTargetObject.folder, /.*\.js$/i, 'absolute', 'files'),
                        testsTarget + sep + 'source.js', "\n\n");
        
                // Copy qunit library
                if(!fm.copyDirectory(global.installationPaths.test + sep + 'libs' + sep + 'qunit', testsTarget, false)){
                    
                    cm.error('Could not copy qunit library');
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
                    htmlIndexCode += '<link rel="stylesheet" href="qunit-2.9.2.css">';
                    htmlIndexCode += '</head>';
                    htmlIndexCode += '<body>';
                    htmlIndexCode += '<div id="qunit"></div>';
                    htmlIndexCode += '<div id="qunit-fixture"></div>';
                    htmlIndexCode += '<script src="qunit-2.9.2.js"></script>';
                    htmlIndexCode += '<script src="source.js"></script>';
                    htmlIndexCode += '<script src="tests.js"></script>';
                    htmlIndexCode += '</body>';
                    htmlIndexCode += '</html>';
                    
                    try{
                        
                        fm.saveFile(testsTarget + sep + 'index.html', htmlIndexCode);
                        
                    }catch(e){
                        
                        cm.error('Could not create ' + testsTarget + sep + 'index.html');
                    }
                }
                
                // Run tests on all configured browsers
                for (let browserName of Object.keys(testSetup.browsers)) {
                    
                    if(testSetup.browsers[browserName]){
                        
                        let httpServerUrl = 'http://localhost:' + testSetup.httpServerPort + '/';
                        
                        httpServerUrl += relativeBuildPath + '/test/' + tsTargetObject.folder;
                        
                        // opn is a node module that opens resources in a cross os manner
                        opn(httpServerUrl, {wait: false, app: [browserName]});
                    }
                }
            }
        }
    }
}