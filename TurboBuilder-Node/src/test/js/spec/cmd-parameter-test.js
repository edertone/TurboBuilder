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

    
    it('should warn the user when test is passed as the only parameter and warnIfCalledWithoutBuild is set to true', function() {

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
    
    
    it('should run php unit tests without warn on a generated lib_php project when test is passed as only parameter and warnIfCalledWithoutBuild is false', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
 
        setup.test.warnIfCalledWithoutBuild = true;
        setup.test.enabledTests[0].enabled = true;
        setup.test.enabledTests[0].coverageReport = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-t'),
            ['--test SHOULD be used at the same time with -b --build or -r --release.',
             'IF YOU RUN THE PROJECT TESTS WITHOUT PREVIOUSLY COMPILING YOUR PROJECT',
             'Do you still want to run the tests (Y/N)?']);
        
        setup.test.warnIfCalledWithoutBuild = false;
        setup.test.enabledTests[0].coverageReport = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        testsGlobalHelper.execTbCmd('-b');
        let testResult = testsGlobalHelper.execTbCmd('-t');
        
        expect(testResult).toContain('launching phpunit tests');
    });
    
    
    it('should fail when no tests are defined on setup', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
 
        setup.test.enabledTests = [];
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-bt')).toContain('Nothing to test. Please setup some tests on test section');
    });
    
    
    it('should fail when no jasmine.json setup file is found at the configured location', function() {

        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        let setup = tsm.getSetup('turbobuilder');  
        setup.test.enabledTests[0].enabled = true;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        // This test makes sure that the expected error is found at the execution result and ALSO checks that there's no extra texts after the end of this error.
        // In fact it checks that the execution result ENDS with this error and nothing more
        expect(testsGlobalHelper.execTbCmd('-bt')).toMatch(/[\s\S]*Could not find jasmine config file at[\s\S]*src.test.js.jasmine\.json[\s\S]*Please setup a jasmine\.json file there so jasmine tests can be executed![\s\S]{0,5}$/);
    });
    
    
    it('should correctly run php unit tests on a generated lib_php project', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
 
        setup.test.enabledTests[0].enabled = true;
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
 
        setup.test.enabledTests[0].enabled = true;
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
        setup.test.enabledTests[0].enabled = true;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let testsLaunchResult = testsGlobalHelper.execTbCmd('-bt');        
        expect(testsLaunchResult).toContain("build start: site_php");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("Error: turbocommons-ts module not found. Did you run npm ci or npm install?");
        expect(testsLaunchResult).toContain('jasmine unit test failures');
    });
});