'use strict';


/**
 * Tests related to the test feature of the cmd app
 */


require('./../../../main/js/globals');
const { execSync } = require('child_process');
const { StringTestsManager, TurboSiteTestsManager } = require('turbotesting-node');
const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');


const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');
const terminalManager = new TerminalManager();
const stringTestsManager = new StringTestsManager();


describe('cmd-parameter-test', function() {
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-test');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });
    
    
    it('should fail on empty project', function() {

        expect(testsGlobalHelper.execTbCmd('-t')).toContain("setup file not found");
        
        expect(testsGlobalHelper.execTbCmd('--test')).toContain("setup file not found");
    });

    
    it('should fail when test is passed as the only parameter', function() {

        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
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

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
 
        setup.test.enabledTests = [];
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-bt')).toContain('Nothing to test. Please setup some tests on test section');
    });
    
    
    it('should fail when no jasmine.json setup file is found at the configured location', function() {

        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        // This test makes sure that the expected error is found at the execution result and ALSO checks that there's no extra texts after the end of this error.
        // In fact it checks that the execution result ENDS with this error and nothing more
        expect(testsGlobalHelper.execTbCmd('-bt')).toMatch(/[\s\S]*Could not find jasmine config file at[\s\S]*src.test.js.jasmine\.json[\s\S]*Please setup a jasmine\.json file there so jasmine tests can be executed![\s\S]{0,5}$/);
    });
    
    
    it('should correctly run php unit tests on a generated lib_php project', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
 
        setup.test.enabledTests[0].coverageReport = false;
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let testResult = testsGlobalHelper.execTbCmd('-bt');
        
        expect(testResult).toContain('launching phpunit tests');
        expect(testResult).toContain('(100%)');
        expect(testResult).toContain('OK, but incomplete, skipped, or risky tests!');
        expect(testResult).toContain('test done');
    });
    
    
    it('should correctly generate coverage report with php unit tests on a generated lib_php project', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
 
        setup.test.enabledTests[0].coverageReport = true;
        setup.test.enabledTests[0].coverageReportOpenAfterTests = false;
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let testResult = testsGlobalHelper.execTbCmd('-bt');
        
        expect(testResult).toContain('launching phpunit tests');
        expect(testResult).toContain('(100%)');
        expect(testResult).toContain('OK, but incomplete, skipped, or risky tests!');
        expect(testResult).toContain('Generating code coverage report in HTML format');
        expect(testResult).toContain('test done');
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        expect(fm.isFile('./target/' + folderName + '/reports/coverage/php/index.html')).toBe(true);
    });
    
    
    it('should fail when a site_php is generated and no npm ci is performed before build and test', function() {
        
        let testsGenerateResult = testsGlobalHelper.execTbCmd('-g site_php');   
        expect(testsGenerateResult).toContain("Generated site_php structure");
        expect(testsGenerateResult).toContain("Created turbobuilder.json file");
        expect(testsGenerateResult).toContain("Generated project structure ok");
        
        let setup = tsm.getSetup('turbobuilder');  
        setup.validate.filesContent.copyPasteDetect = [];
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let testsLaunchResult = testsGlobalHelper.execTbCmd('-bt');        
        expect(testsLaunchResult).toContain("build start: site_php");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("Error: turbocommons-ts module not found. Did you run npm ci or npm install?");
        expect(testsLaunchResult).toContain('jasmine unit test failures');
    });
    
    
    it('should successfully run the jasmine tests on a generated site_php project when baseUrl is the root', function() {

        let sep = fm.dirSep();
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        // Modify the project setup to sync the files to /
        setup.metadata.name = 'project-name';
        setup.sync.destPath = 'C:/turbosite-webserver-symlink';         
        setup.sync.remoteUrl = 'https://localhost';          
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        // Add the project name to the package.json file
        let packageSetup = JSON.parse(fm.readFile('.' + sep + 'package.json'));
        packageSetup.name = 'project-name';
        expect(fm.saveFile('.' + sep + 'package.json', JSON.stringify(packageSetup))).toBe(true);
        
        // Modify the turbosite tests setup to point the host to /
        let turboSiteSetup = JSON.parse(fm.readFile('.' + sep + 'turbosite.json'));
        turboSiteSetup.baseURL = '';
        expect(fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(turboSiteSetup))).toBe(true);
        
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

        let sep = fm.dirSep();
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
                
        // Modify the project setup to sync the files to /subfolder
        setup.metadata.name = 'project-name';
        setup.sync.destPath = 'C:/turbosite-webserver-symlink/subfolder';        
        setup.sync.remoteUrl = 'https://localhost/subfolder';        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        // Add the project name to the package.json file
        let packageSetup = JSON.parse(fm.readFile('.' + sep + 'package.json'));
        packageSetup.name = 'project-name';
        expect(fm.saveFile('.' + sep + 'package.json', JSON.stringify(packageSetup))).toBe(true);
        
        // Modify the turbosite tests setup to point the host to /subfolder
        let turboSiteSetup = JSON.parse(fm.readFile('.' + sep + 'turbosite.json'));
        turboSiteSetup.baseURL = 'subfolder';
        expect(fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(turboSiteSetup))).toBe(true);
        
        // Create the subfolder on server
        if(!fm.isDirectory(setup.sync.destPath)){
            
            expect(fm.createDirectory(setup.sync.destPath)).toBe(true);
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

        let sep = fm.dirSep();
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        // Modify the project setup to sync the files to /subfolder1/subfolder2
        setup.metadata.name = 'project-name';
        setup.sync.destPath = 'C:/turbosite-webserver-symlink/subfolder1/subfolder2';        
        setup.sync.remoteUrl = 'https://localhost/subfolder1/subfolder2';          
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        // Add the project name to the package.json file
        let packageSetup = JSON.parse(fm.readFile('.' + sep + 'package.json'));
        packageSetup.name = 'project-name';
        expect(fm.saveFile('.' + sep + 'package.json', JSON.stringify(packageSetup))).toBe(true);
        
        // Modify the turbosite tests setup to point the host to /subfolder1/subfolder2
        let turboSiteSetup = JSON.parse(fm.readFile('.' + sep + 'turbosite.json'));
        turboSiteSetup.baseURL = 'subfolder1/subfolder2';
        expect(fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(turboSiteSetup))).toBe(true);
        
        // Create the subfolders on server
        if(!fm.isDirectory(setup.sync.destPath)){
            
            expect(fm.createDirectory(setup.sync.destPath, true)).toBe(true);
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