'use strict';

/**
 * this module contains all the code related to the test process
 */


const { FilesManager, ArrayUtils } = require('turbocommons-ts');
const { spawn } = require('child_process');
const console = require('./console');
const buildModule = require('./build');
const releaseModule = require('./release');
const opn = require('opn');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process); 


/**
 * Execute the test process
 */
exports.execute = function (build, release) {
    
    console.log("\ntest start");
    
    if(!ArrayUtils.isArray(global.setup.test) || global.setup.test.length <= 0){
        
        console.error("Nothing to test. Please setup some tests on test section in " + global.fileNames.setup);
    }
    
    // Check which build paths must be tested
    let pathsToTest = [];
    
    if(build){
        
        pathsToTest.push(buildModule.getBuildRelativePath());
    }
    
    if(release){
        
        pathsToTest.push(releaseModule.getReleaseRelativePath());
    }
    
    for (let testSetup of global.setup.test) {
        
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
    
    console.success('test done');
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
   
    console.success('started http-server');
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
        
        console.error('build.lib_php is mandatory on ' + global.fileNames.setup + ' to run php tests');
    }
    
    let sep = fm.dirSep();
    
    for (let relativeBuildPath of relativeBuildPaths) {
    
        let destPath = global.runtimePaths.target + sep + relativeBuildPath;
        let destTestsPath = destPath + sep + 'test' + sep + 'php';
        let coverageReportPath = destPath + sep + 'coverage' + sep + 'php';
        
        fm.createDirectory(destTestsPath, true);
        
        // Copy all tests source code
        fm.copyDirectory(global.runtimePaths.root + sep + testSetup.testsRoot, destTestsPath);
        
        console.success("launching phpunit tests at:\n");
        console.success(destTestsPath + "\n");
        
        // Launch unit tests via php executable
        let phpExecCommand = 'php';
        
        phpExecCommand += ' "' + global.installationPaths.testResources + sep + 'libs' + sep + 'phpunit-7.1.5.phar"';
        
        if(testSetup.coverageReport){
            
            console.warning("Warning: Enabling Php coverage report in unit tests is many times slower");
            
            phpExecCommand += ' --coverage-html "' + coverageReportPath + '"';                           
        }
        
        phpExecCommand += ' --configuration "' + destTestsPath + sep + 'PhpUnitSetup.xml"';     
        phpExecCommand += ' "' + destPath + '/"';
        
        let testsResult = console.exec(phpExecCommand, '', true);
                    
        // Open the coverage report if necessary
        if(testSetup.coverageReport && testSetup.coverageReportOpenAfterTests){
        
            // opn is a node module that opens resources in a cross os manner
            opn(coverageReportPath + sep + 'index.html', {wait: false});
        }  
        
        if(!testsResult){
    
            console.error('There are PHP unit test failures');
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
    
    console.success("launching jasmine tests");

    let jasmineExecCommand = global.installationPaths.jasmineBin + ' --config=' + testSetup.jasmineConfig;
    
    
    if(!console.exec(jasmineExecCommand, '', true)){
        
        console.error('There are jasmine unit test failures');
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
        
        console.error('build.lib_ts is mandatory on ' + global.fileNames.setup + ' to run qunit tests');
    }
    
    console.success("launching qunit tests");
    
    let sep = fm.dirSep();
    let srcTestsPath = global.runtimePaths.root + sep + testSetup.testsRoot;
    
    launchHttpServer(global.runtimePaths.target, testSetup.httpServerPort);
    
    for (let relativeBuildPath of relativeBuildPaths) {
        
        let destPath = global.runtimePaths.target + sep + relativeBuildPath;
        let destTestsPath = destPath + sep + 'test';
        
        fm.createDirectory(destTestsPath, true);
        
        // Generate all the files to launch the tests
        for (let tsTargetObject of global.setup.build.lib_ts.targets) {
            
            if(testSetup.targets.indexOf(tsTargetObject.folder) >= 0){
                
                let jsTarget = tsTargetObject.jsTarget;
                let testsTarget = destTestsPath + sep + tsTargetObject.folder;
                
                // Create current jsTarget folder
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
                fm.mergeFiles(fm.findDirectoryItems(destPath + sep + 'dist' + sep + tsTargetObject.folder, /.*\.js$/i, 'absolute', 'files'),
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
                    
                    if(!fm.saveFile(testsTarget + sep + 'index.html', htmlIndexCode)){
                        
                        console.error('Could not create ' + testsTarget + sep + 'index.html');
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