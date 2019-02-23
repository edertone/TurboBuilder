#!/usr/bin/env node

'use strict';


/**
 * Tests related to the correct operation of the error management turbosite feature
 */

const utils = require('../sitephp-test-utils');
const path = require('path');
const { StringUtils, FilesManager } = require('turbocommons-ts');
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
        
        this.indexPhpPath = turbobuilderSetup.sync.destPath + '/site/index.php';
        this.turbositeSetupBackup = utils.getTurbositeSetupFromIndexPhp(this.indexPhpPath);
        
        this.homeViewFilePath = turbobuilderSetup.sync.destPath + '/site/view/views/home/home.php';
        this.homeViewFileContentsBackup = fm.readFile(this.homeViewFilePath);
    });
    
    
    afterEach(function() {

        // Restore the turbosite setup to the previous value
        expect(utils.saveSetupToIndexPhp(this.turbositeSetupBackup, "turbosite", this.indexPhpPath)).toBe(true);
        
        // Restore the home view php file contents to the value it has before test was run
        expect(fm.saveFile(this.homeViewFilePath, this.homeViewFileContentsBackup)).toBe(true);
    });
    
    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.driver.quit(); 
    });
    
    
    it('should show errors on browser for a site_php project type when errors are enabled on setup', function(done) {
        
        let turbositeSetup = utils.getTurbositeSetupFromIndexPhp(this.indexPhpPath);
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
        
        let turbositeSetup = utils.getTurbositeSetupFromIndexPhp(this.indexPhpPath);
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
        
        let turbositeSetup = utils.getTurbositeSetupFromIndexPhp(this.indexPhpPath);
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
        
        let turbositeSetup = utils.getTurbositeSetupFromIndexPhp(this.indexPhpPath);
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
        
        let turbositeSetup = utils.getTurbositeSetupFromIndexPhp(this.indexPhpPath);
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

        let turbositeSetup = utils.getTurbositeSetupFromIndexPhp(this.indexPhpPath);
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
});