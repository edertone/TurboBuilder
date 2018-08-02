#!/usr/bin/env node

'use strict';


/**
 * Tests related to the test feature of the cmd app
 */


const utils = require('../test-utils');
const { execSync } = require('child_process');


describe('cmd-parameter-test', function() {
    
    beforeEach(function() {
        
        this.workdir = utils.createAndSwitchToTempFolder('test-test');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });
    
    
    it('should fail on empty project', function() {

        expect(utils.exec('-t')).toContain("setup file not found");
        
        expect(utils.exec('--test')).toContain("setup file not found");
    });

    
    it('should fail when test is passed as the only parameter', function() {

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        expect(utils.exec('-t')).toContain('--test must be used at the same time as -b --build or -r --release');
        expect(utils.exec('--test')).toContain('--test must be used at the same time as -b --build or -r --release');
    });
    
    
    it('should fail when no tests are defined on setup', function() {

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
 
        setup.test = [];
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-bt')).toContain('Nothing to test. Please setup some tests on test section');
    });
    
    
    it('should fail when a site_php is generated and no npm install is performed before build and test', function() {
        
        let testsGenerateResult = utils.exec('-g site_php');   
        expect(testsGenerateResult).toContain("Generated site_php structure");
        expect(testsGenerateResult).toContain("Created turbobuilder.json file");
        expect(testsGenerateResult).toContain("Generated project structure ok");
        
        let testsLaunchResult = utils.exec('-bt');        
        expect(testsLaunchResult).toContain("build start: site_php");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("Error: turbocommons-ts module not found. Did you run npm install?");
        expect(testsLaunchResult).toContain('jasmine unit test failures');
    });
    
    
    it('should successfully run the jasmine tests on a generated site_php project', function() {

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let npmInstallResult = execSync('npm install', {stdio : 'pipe'}).toString();        
        expect(npmInstallResult).toContain("added");
        expect(npmInstallResult).toContain("packages in");
        expect(npmInstallResult).not.toContain("npm ERR");
        
        let testsLaunchResult = utils.exec('-cbst');        
        expect(testsLaunchResult).toContain("clean start");
        expect(testsLaunchResult).toContain("build start");
        expect(testsLaunchResult).toContain("sync start");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("0 failures");
        expect(testsLaunchResult).not.toContain('jasmine unit test failures');
        
        expect(utils.exec('-c')).toContain("clean ok");
    });
    
    
    it('should successfully run the jasmine tests on a generated site_php project on a webserver subfolder', function() {

        let sep = utils.fm.dirSep();
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        // Modify the project setup to sync the files to /subfolder
        let setup = utils.readSetupFile();        
        setup.sync[0].destPath = setup.sync[0].destPath + sep + 'subfolder';        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        // Modify the turbosite tests setup to point the host to /subfolder
        let turboSiteSetup = JSON.parse(utils.fm.readFile('.' + sep + 'turbosite.json'));
        turboSiteSetup.baseURL = 'subfolder';
        turboSiteSetup.testsSetup.host += '/subfolder';
        expect(utils.fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(turboSiteSetup))).toBe(true);
        
        // Create the subfolder on server
        if(!utils.fm.isDirectory(setup.sync[0].destPath)){
            
            expect(utils.fm.createDirectory(setup.sync[0].destPath)).toBe(true);
        }
        
        let npmInstallResult = execSync('npm install', {stdio : 'pipe'}).toString();        
        expect(npmInstallResult).toContain("added");
        expect(npmInstallResult).toContain("packages in");
        expect(npmInstallResult).not.toContain("npm ERR");
        
        // launch selenium tests on root localhost
        let testsLaunchResult = utils.exec('-cbst');        
        expect(testsLaunchResult).toContain("clean start");
        expect(testsLaunchResult).toContain("build start");
        expect(testsLaunchResult).toContain("sync start");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("0 failures");
        expect(testsLaunchResult).not.toContain('jasmine unit test failures');
        
        expect(utils.exec('-c')).toContain("clean ok");
    });
    
    
    it('should successfully run the jasmine tests on a generated site_php project on a webserver with 2 levels of subfolder depth', function() {

        let sep = utils.fm.dirSep();
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        // Modify the project setup to sync the files to /subfolder1/subfolder2
        let setup = utils.readSetupFile();        
        setup.sync[0].destPath = setup.sync[0].destPath + sep + 'subfolder1' + sep + 'subfolder2';        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        // Modify the turbosite tests setup to point the host to /subfolder
        let turboSiteSetup = JSON.parse(utils.fm.readFile('.' + sep + 'turbosite.json'));
        turboSiteSetup.baseURL = 'subfolder1/subfolder2';
        turboSiteSetup.testsSetup.host += '/subfolder1/subfolder2';
        expect(utils.fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(turboSiteSetup))).toBe(true);
        
        // Create the subfolders on server
        if(!utils.fm.isDirectory(setup.sync[0].destPath)){
            
            expect(utils.fm.createDirectory(setup.sync[0].destPath, true)).toBe(true);
        }
        
        let npmInstallResult = execSync('npm install', {stdio : 'pipe'}).toString();        
        expect(npmInstallResult).toContain("added");
        expect(npmInstallResult).toContain("packages in");
        expect(npmInstallResult).not.toContain("npm ERR");
        
        // launch selenium tests on root localhost
        let testsLaunchResult = utils.exec('-cbst');        
        expect(testsLaunchResult).toContain("clean start");
        expect(testsLaunchResult).toContain("build start");
        expect(testsLaunchResult).toContain("sync start");
        expect(testsLaunchResult).toContain("test start");
        expect(testsLaunchResult).toContain("0 failures");
        expect(testsLaunchResult).not.toContain('jasmine unit test failures');
        
        expect(utils.exec('-c')).toContain("clean ok");
    });
});