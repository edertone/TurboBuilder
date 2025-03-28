'use strict';

/**
 * this module contains all the code related to the test process
 */


require('./globals');

const { ArrayUtils, StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { ConsoleManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');
const setupModule = require('./setup');
const appsModule = require('./apps');
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
        
        if(testSetup.enabled === true){
            
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
    }
    
    cm.success('test done');
};




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
        let phpExecCommand = '"../phpunit.phar"';
        
        if(!StringUtils.isEmpty(testSetup.filter)){
            
            phpExecCommand += ' --filter ' + testSetup.filter;          
        }
        
        if(testSetup.coverageReport){
            
            cm.warning("Warning: Enabling Php coverage report in unit tests is many times slower");
            
            phpExecCommand += ' --coverage-html "' + setupModule.getProjectName() + '/reports/coverage/php"';                           
        }
        
        phpExecCommand += ' --configuration "' + setupModule.getProjectName() + '/test/php/PhpUnitSetup.xml"';     
        phpExecCommand += ' "' + relativeBuildPath + '/"';
        
        try{
                   
            appsModule.callPhpCmd(phpExecCommand, true);
           
        }catch(e){

            cm.error('There are PHP unit test failures\n\n' + e.message);
        }
        
        // Open the coverage report if necessary
        if(testSetup.coverageReport && testSetup.coverageReportOpenAfterTests){
        
            // opn is a node module that opens resources in a cross OS manner
            opn(coverageReportPath + sep + 'index.html', {wait: false});
        }  

        // Enabling test filters means a failure will be shown to the user, to prevent projects with missing tests
        if(!StringUtils.isEmpty(testSetup.filter)){
            
            cm.error('TEST FILTERS ENABLED, not all tests have been executed!');         
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
    
    appsModule.launchHttpServer(global.runtimePaths.target, testSetup.httpServerPort);
    
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
                
                // Copy sourcemaps (if exist) from generated build sources to tests target
                fm.copyFile(destPath + sep + 'dist' + sep + tsTargetObject.folder + sep + tsTargetObject.mergedFile + '.js.map',
                    testsTarget + sep + tsTargetObject.mergedFile + '.js.map');
        
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
                    htmlIndexCode += '<link rel="stylesheet" href="qunit-2.19.4.css">';
                    htmlIndexCode += '</head>';
                    htmlIndexCode += '<body>';
                    htmlIndexCode += '<div id="qunit"></div>';
                    htmlIndexCode += '<div id="qunit-fixture"></div>';
                    htmlIndexCode += '<script src="qunit-2.19.4.js"></script>';
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