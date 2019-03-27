#!/usr/bin/env node

'use strict';


/**
 * Tests related to the correct operation of the error management turbosite feature
 */

const utils = require('../sitephp-test-utils');
const path = require('path');
const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const webdriver = require('selenium-webdriver');


let fm = new FilesManager(require('fs'), require('os'), path, process);


describe('selenium-site_php-error-manager-feature.js', function() {

    beforeAll(function() {
        
        utils.checkChromeDriverAvailable();
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        // Initialize the chrome driver with english language
        let chromeCapabilities = webdriver.Capabilities.chrome();
        
        let chromeOptions = {
            "args": ["--lang=en"]
        };
        
        chromeCapabilities.set('chromeOptions', chromeOptions);
        
        // Enable logs so the tests can read them
        let loggingPrefs = new webdriver.logging.Preferences();
        loggingPrefs.setLevel('browser', webdriver.logging.Level.ALL); 
        loggingPrefs.setLevel('driver', webdriver.logging.Level.ALL); 
        
        this.driver = new webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .setLoggingPrefs(loggingPrefs)
            .build();
    });
    
    
    beforeEach(function() {

        let turbobuilderSetup = JSON.parse(fm.readFile('turbobuilder.json'));        
        
        this.destPath = turbobuilderSetup.sync.destPath;
        this.indexPhpPath = turbobuilderSetup.sync.destPath + '/site/index.php';
        this.indexPhpBackup = fm.readFile(this.indexPhpPath);
        
        this.homeViewFilePath = turbobuilderSetup.sync.destPath + '/site/view/views/home/home.php';
        this.homeViewFileContentsBackup = fm.readFile(this.homeViewFilePath);
    });
    
    
    afterEach(function() {

        // Restore the whole index.php file to the previous value
        expect(fm.saveFile(this.indexPhpPath, this.indexPhpBackup)).toBe(true);
        
        // Restore the home view php file contents to the value it has before test were run
        expect(fm.saveFile(this.homeViewFilePath, this.homeViewFileContentsBackup)).toBe(true);
        
        // Delete the logs folder if it exists
        if(fm.isDirectory(this.destPath + '/logs')){
            
            expect(fm.deleteDirectory(this.destPath + '/logs', true)).toBe(true);
        }
    });
    
    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.driver.quit(); 
    });
    
    
    it('should show errors on browser for a site_php project type when errors are enabled on setup', function(done) {
        
        let turbositeSetup = utils.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);

        turbositeSetup.errorSetup.exceptionsToBrowser = true;
        expect(utils.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php nonexistantfunction();', 1))
              ).toBe(true);
        
        let url = utils.replaceWildCardsOnText("https://$host/$locale");
        
        this.driver.get(url).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                    .toContain('turbosite-global-error-manager-problem', url + ' Expected a php problem: exception to be shown on browser');
                
                expect(source)
                    .toContain('FATAL EXCEPTION', url + ' Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('Call to undefined function nonexistantfunction()', url + ' Expected a php problem: exception to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    it('should show warnings on browser for a site_php project type when warnings are enabled on setup', function(done) {
        
        let turbositeSetup = utils.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(utils.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php $a=$b;', 1))
              ).toBe(true);
        
        let url = utils.replaceWildCardsOnText("https://$host/$locale");
        
        this.driver.get(url).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                    .toContain('turbosite-global-error-manager-problem', url + ' Expected a php problem: warning to be shown on browser');
                
                expect(source)
                    .toContain('E_NOTICE', url + ' Expected a php problem: warning to be shown on browser');
            
                expect(source)
                    .toContain('Undefined variable: b', url + ' Expected a php problem: warning to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    it('should show both errors and warnings on browser for a site_php project type when errors and warnings are enabled on setup', function(done) {
        
        let turbositeSetup = utils.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.exceptionsToBrowser = true;
        turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(utils.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php $a=$b; nonexistantfunction();', 1))
              ).toBe(true);
        
        let url = utils.replaceWildCardsOnText("https://$host/$locale");
        
        this.driver.get(url).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                .toContain('turbosite-global-error-manager-problem', url + ' Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('FATAL EXCEPTION', url + ' Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('Call to undefined function nonexistantfunction()', url + ' Expected a php problem: exception to be shown on browser');
        
                expect(source)
                    .toContain('E_NOTICE', url + ' Expected a php problem: warning to be shown on browser');
            
                expect(source)
                    .toContain('Undefined variable: b', url + ' Expected a php problem: warning to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    it('should show multiple warnings on browser for a site_php project type when warnings are enabled on setup', function(done) {
        
        let turbositeSetup = utils.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(utils.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php $a=$b; $a=$c; $a=$d;', 1))
              ).toBe(true);
        
        let url = utils.replaceWildCardsOnText("https://$host/$locale");
        
        this.driver.get(url).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                .toContain('turbosite-global-error-manager-problem', url + ' Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('E_NOTICE', url + ' Expected a php problem: warning to be shown on browser');
            
                expect(source)
                    .toContain('Undefined variable: b', url + ' Expected a php problem: warning to be shown on browser');
        
                expect(source)
                    .toContain('Undefined variable: c', url + ' Expected a php problem: warning to be shown on browser');
    
                expect(source)
                    .toContain('Undefined variable: d', url + ' Expected a php problem: warning to be shown on browser');
    
                return done();
            });
        });
    });
    
    
    it('should not show warnings on browser for a site_php project type when disabled in setup', function(done) {
        
        let turbositeSetup = utils.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.warningsToBrowser = false;
        expect(utils.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php $a=$b;', 1))
              ).toBe(true);
        
        let url = utils.replaceWildCardsOnText("https://$host/$locale");
        
        this.driver.get(url).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                    .not.toContain('turbosite-global-error-manager-problem', url + ' NOT Expected a php problem: warning to be shown on browser');
                
                expect(source)
                    .not.toContain('E_NOTICE', url + ' NOT Expected a php problem: warning to be shown on browser');
            
                expect(source)
                    .not.toContain('Undefined variable: b', url + ' NOT Expected a php problem: warning to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    it('should not show errors on browser for a site_php project type when disabled in setup', function(done) {

        let turbositeSetup = utils.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.exceptionsToBrowser = false;
        expect(utils.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php nonexistantfunction();', 1))
              ).toBe(true);
        
        let url = utils.replaceWildCardsOnText("https://$host/$locale");
        
        this.driver.get(url).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                    .not.toContain('turbosite-global-error-manager-problem', url + ' NOT Expected a php problem: exception to be shown on browser');
                
                expect(source)
                    .not.toContain('FATAL EXCEPTION', url + ' NOT Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .not.toContain('Call to undefined function nonexistantfunction()', url + ' NOT Expected a php problem: exception to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    
    it('should show errors and warnings on browser for a server_php project type when running a buggy web service and errors are enabled on setup', function(done) {
    
        // TODO
        return done();
    });
    
    
    it('should show errors on log for a server_php project type when running a buggy web service and log errors are enabled on setup', function(done) {
       
        // TODO
        return done();
    });
    
    
    it('should show errors on log for a site_php project type when log errors are enabled on setup', function(done) {
        
        // Set the logs source on the turbodepot setup
        let turbodepotSetup = utils.getSetupFromIndexPhp('turbodepot', this.indexPhpPath);
           
        turbodepotSetup.sources.fileSystem = [
            {
                "name": "logs_source",
                "path": this.destPath + '/logs'
            }
        ];
        turbodepotSetup.depots[0].logs.source = 'logs_source';
        expect(utils.saveSetupToIndexPhp(turbodepotSetup, "turbodepot", this.indexPhpPath)).toBe(true);
       
        // Enable exceptions to log on turbosite setup
        let turbositeSetup = utils.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        turbositeSetup.errorSetup.exceptionsToBrowser = true;
        turbositeSetup.errorSetup.exceptionsToLog = 'php_errors';
        expect(utils.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
       
        // Make sure the logs folder exists and the log file does not exist
        expect(fm.isDirectory(this.destPath + '/logs')).toBe(false);
        expect(fm.createDirectory(this.destPath + '/logs')).toBe(true);
        expect(fm.isFile(this.destPath + '/logs/php_errors')).toBe(false);
       
        // Generate an exception on home.php file
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php nonexistantfunction();', 1))
              ).toBe(true);
        
        let url = utils.replaceWildCardsOnText("https://$host/$locale");
        
        this.driver.get(url).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(StringUtils.countStringOccurences(source, 'turbosite-global-error-manager-problem')).toBe(1);
                
                expect(source)
                    .toContain('turbosite-global-error-manager-problem', url + ' Expected a php problem: exception to be shown on browser');
                
                expect(source)
                    .toContain('FATAL EXCEPTION', url + ' Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('Call to undefined function nonexistantfunction()', url + ' Expected a php problem: exception to be shown on browser');
            
                expect(fm.isFile(this.destPath + '/logs/php_errors')).toBe(true);
           
                let logContents = fm.readFile(this.destPath + '/logs/php_errors');
                 
                expect(logContents).toContain('FATAL EXCEPTION Call to undefined function nonexistantfunction()');
                expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION Call to undefined function nonexistantfunction()')).toBe(1);
                
                expect(logContents).toContain('home.php line 1');
                expect(StringUtils.countStringOccurences(logContents, 'home.php line 1')).toBe(1);
                
                return done();
            });
        });
    });
});