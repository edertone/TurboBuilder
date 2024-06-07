'use strict';


/**
 * These tests will verify that all the test cases that are included with the site_php template by default pass when a new project 
 * is created using the turbobuilder cmd tool.
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

 
describe('cmd-sitephp-template-tests', function() {
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-test');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });
    
    
    it('should successfully run the jasmine tests on a generated site_php project when baseUrl is the root', function() {

        let sep = fm.dirSep();
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.test.enabledTests[0].enabled = true;
        
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
                
        setup.test.enabledTests[0].enabled = true;
        
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
        
        setup.test.enabledTests[0].enabled = true;
        
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