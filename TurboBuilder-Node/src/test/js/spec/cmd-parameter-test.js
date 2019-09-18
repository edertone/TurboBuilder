#!/usr/bin/env node

'use strict';


/**
 * Tests related to the test feature of the cmd app
 */


const utils = require('../cmd-parameter-test-utils');
const { execSync } = require('child_process');
const { StringTestsManager } = require('turbotesting-node');
const { StringUtils } = require('turbocommons-ts');
const { TerminalManager } = require('turbodepot-node');


const terminalManager = new TerminalManager();
const stringTestsManager = new StringTestsManager();


describe('cmd-parameter-test', function() {
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-test');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(utils.fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });
    
    
    it('should fail on empty project', function() {

        expect(testsGlobalHelper.execTbCmd('-t')).toContain("setup file not found");
        
        expect(testsGlobalHelper.execTbCmd('--test')).toContain("setup file not found");
    });

    
    it('should fail when test is passed as the only parameter', function() {

        utils.generateProjectAndSetTurbobuilderSetup('lib_ts', null, []);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-t'),
            ['--test SHOULD be used at the same time with -b --build or -r --release.',
             'IF YOU RUN THE PROJECT TESTS WITHOUT PREVIOUSLY COMPILING YOUR PROJECT',
             'Do you still want to run the tests (Y/N)?']);
            
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('--test'),
            ['--test SHOULD be used at the same time with -b --build or -r --release.',
             'IF YOU RUN THE PROJECT TESTS WITHOUT PREVIOUSLY COMPILING YOUR PROJECT',
             'Do you still want to run the tests (Y/N)?']);
    });
    
    
    it('should fail when no tests are defined on setup', function() {

        let setup = utils.generateProjectAndSetTurbobuilderSetup('lib_ts', null, []);
 
        setup.test = [];
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-bt')).toContain('Nothing to test. Please setup some tests on test section');
    });
    
    
    it('should correctly run php unit tests on a generated lib_php project', function() {

        let setup = utils.generateProjectAndSetTurbobuilderSetup('lib_php', null, []);
 
        setup.test[0].coverageReport = false;
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let testResult = testsGlobalHelper.execTbCmd('-bt');
        
        expect(testResult).toContain('launching phpunit tests');
        expect(testResult).toContain('(100%)');
        expect(testResult).toContain('OK, but incomplete, skipped, or risky tests!');
        expect(testResult).toContain('test done');
    });
    
    
    it('should correctly generate coverage report with php unit tests on a generated lib_php project', function() {

        let setup = utils.generateProjectAndSetTurbobuilderSetup('lib_php', null, []);
 
        setup.test[0].coverageReport = true;
        setup.test[0].coverageReportOpenAfterTests = false;
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let testResult = testsGlobalHelper.execTbCmd('-bt');
        
        expect(testResult).toContain('launching phpunit tests');
        expect(testResult).toContain('(100%)');
        expect(testResult).toContain('OK, but incomplete, skipped, or risky tests!');
        expect(testResult).toContain('Generating code coverage report in HTML format');
        expect(testResult).toContain('test done');
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        expect(utils.fm.isFile('./target/' + folderName + '/reports/coverage/php/index.html')).toBe(true);
    });
    
    
    it('should fail when a site_php is generated and no npm ci is performed before build and test', function() {
        
        let testsGenerateResult = testsGlobalHelper.execTbCmd('-g site_php');   
        expect(testsGenerateResult).toContain("Generated site_php structure");
        expect(testsGenerateResult).toContain("Created turbobuilder.json file");
        expect(testsGenerateResult).toContain("Generated project structure ok");
        
        let setup = testsGlobalHelper.readSetupFile();  
        setup.validate.filesContent.copyPasteDetect = [];
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let testsLaunchResult = testsGlobalHelper.execTbCmd('-bt');        
        expect(testsLaunchResult).toContain("build start: site_php");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("Error: turbocommons-ts module not found. Did you run npm ci or npm install?");
        expect(testsLaunchResult).toContain('jasmine unit test failures');
    });
    
    
    it('should successfully run the jasmine tests on a generated site_php project when baseUrl is the root', function() {

        let sep = utils.fm.dirSep();
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        // Modify the project setup to sync the files to /
        setup.metadata.name = 'project-name';
        setup.sync.destPath = 'C:/turbosite-webserver-symlink';         
        setup.sync.remoteUrl = 'https://localhost';          
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        // Add the project name to the package.json file
        let packageSetup = JSON.parse(utils.fm.readFile('.' + sep + 'package.json'));
        packageSetup.name = 'project-name';
        expect(utils.fm.saveFile('.' + sep + 'package.json', JSON.stringify(packageSetup))).toBe(true);
        
        // Modify the turbosite tests setup to point the host to /subfolder
        let turboSiteSetup = JSON.parse(utils.fm.readFile('.' + sep + 'turbosite.json'));
        turboSiteSetup.baseURL = '';
        expect(utils.fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(turboSiteSetup))).toBe(true);
        
        let npmInstallResult = execSync('npm ci', {stdio : 'pipe'}).toString();
        expect(npmInstallResult).not.toContain("npm ERR");
        
        let testsLaunchResult = testsGlobalHelper.execTbCmd('-cbst');        
        expect(testsLaunchResult).toContain("clean start");
        expect(testsLaunchResult).toContain("build start");
        expect(testsLaunchResult).toContain("sync start");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("0 failures");
        expect(testsLaunchResult).not.toContain('jasmine unit test failures');
        
        expect(testsGlobalHelper.execTbCmd('-c')).toContain("clean ok");
    });
    
    
    it('should successfully run the jasmine tests on a generated site_php project on a webserver subfolder', function() {

        let sep = utils.fm.dirSep();
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
                
        // Modify the project setup to sync the files to /subfolder
        setup.metadata.name = 'project-name';
        setup.sync.destPath = 'C:/turbosite-webserver-symlink/subfolder';        
        setup.sync.remoteUrl = 'https://localhost/subfolder';        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        // Add the project name to the package.json file
        let packageSetup = JSON.parse(utils.fm.readFile('.' + sep + 'package.json'));
        packageSetup.name = 'project-name';
        expect(utils.fm.saveFile('.' + sep + 'package.json', JSON.stringify(packageSetup))).toBe(true);
        
        // Modify the turbosite tests setup to point the host to /subfolder
        let turboSiteSetup = JSON.parse(utils.fm.readFile('.' + sep + 'turbosite.json'));
        turboSiteSetup.baseURL = 'subfolder';
        expect(utils.fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(turboSiteSetup))).toBe(true);
        
        // Create the subfolder on server
        if(!utils.fm.isDirectory(setup.sync.destPath)){
            
            expect(utils.fm.createDirectory(setup.sync.destPath)).toBe(true);
        }
        
        let npmInstallResult = execSync('npm ci', {stdio : 'pipe'}).toString();
        expect(npmInstallResult).not.toContain("npm ERR");
        
        // launch selenium tests on root localhost
        let testsLaunchResult = testsGlobalHelper.execTbCmd('-cbst');        
        expect(testsLaunchResult).toContain("clean start");
        expect(testsLaunchResult).toContain("build start");
        expect(testsLaunchResult).toContain("sync start");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("0 failures");
        expect(testsLaunchResult).not.toContain('jasmine unit test failures');
        
        expect(testsGlobalHelper.execTbCmd('-c')).toContain("clean ok");
    });
    
    
    it('should successfully run the jasmine tests on a generated site_php project on a webserver with 2 levels of subfolder depth', function() {

        let sep = utils.fm.dirSep();
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        // Modify the project setup to sync the files to /subfolder1/subfolder2
        setup.metadata.name = 'project-name';
        setup.sync.destPath = 'C:/turbosite-webserver-symlink/subfolder1/subfolder2';        
        setup.sync.remoteUrl = 'https://localhost/subfolder1/subfolder2';          
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        // Add the project name to the package.json file
        let packageSetup = JSON.parse(utils.fm.readFile('.' + sep + 'package.json'));
        packageSetup.name = 'project-name';
        expect(utils.fm.saveFile('.' + sep + 'package.json', JSON.stringify(packageSetup))).toBe(true);
        
        // Modify the turbosite tests setup to point the host to /subfolder
        let turboSiteSetup = JSON.parse(utils.fm.readFile('.' + sep + 'turbosite.json'));
        turboSiteSetup.baseURL = 'subfolder1/subfolder2';
        expect(utils.fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(turboSiteSetup))).toBe(true);
        
        // Create the subfolders on server
        if(!utils.fm.isDirectory(setup.sync.destPath)){
            
            expect(utils.fm.createDirectory(setup.sync.destPath, true)).toBe(true);
        }
        
        let npmInstallResult = execSync('npm ci', {stdio : 'pipe'}).toString();
        expect(npmInstallResult).not.toContain("npm ERR");
        
        // launch selenium tests on root localhost
        let testsLaunchResult = testsGlobalHelper.execTbCmd('-cbst');        
        expect(testsLaunchResult).toContain("clean start");
        expect(testsLaunchResult).toContain("build start");
        expect(testsLaunchResult).toContain("sync start");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("0 failures");
        expect(testsLaunchResult).not.toContain('jasmine unit test failures');
        
        expect(testsGlobalHelper.execTbCmd('-c')).toContain("clean ok");
    });
});