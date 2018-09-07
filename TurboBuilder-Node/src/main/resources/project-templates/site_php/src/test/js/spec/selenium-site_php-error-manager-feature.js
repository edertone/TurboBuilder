#!/usr/bin/env node

'use strict';


/**
 * Tests related to the correct operation of the error management turbosite feature
 */

const utils = require('../test-utils');
const path = require('path');
const { execSync } = require('child_process');
const { StringUtils, FilesManager, ArrayUtils } = require('turbocommons-ts');
const webdriver = require('selenium-webdriver');


let fm = new FilesManager(require('fs'), require('os'), path, process);


describe('selenium-site_php-error-manager-feature.js', function() {

    beforeAll(function() {
        
        utils.checkChromeDriverAvailable();
        
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

        this.turbobuilderSetup = JSON.parse(fm.readFile('turbobuilder.json'));
        
        this.turbobuilderSetupPath = this.turbobuilderSetup.sync[0].destPath + '/site/turbosite.json';
        this.turbositeSetupString = fm.readFile(this.turbobuilderSetupPath);
        this.turbositeSetup = JSON.parse(this.turbositeSetupString);
        
        this.homeViewFilePath = this.turbobuilderSetup.sync[0].destPath + '/site/view/views/home/home.php';
        this.homeViewFileContents = fm.readFile(this.homeViewFilePath);
    });
    
    
    afterEach(function() {

        // Restore the turbosite setup to the previous value
        expect(fm.saveFile(this.turbobuilderSetupPath, this.turbositeSetupString)).toBe(true);
        
        // Restore the home view php file contents to the value it has before test was run
        expect(fm.saveFile(this.homeViewFilePath, this.homeViewFileContents)).toBe(true);
    });
    
    
    afterAll(function() {

        this.driver.quit(); 
    });
    
    
    it('should show errors on browser for a site_php project type when errors are enabled on setup', function(done) {
        
        this.turbositeSetup.errorSetup.exceptionsToBrowser = true;
        expect(fm.saveFile(this.turbobuilderSetupPath, JSON.stringify(this.turbositeSetup))).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(this.homeViewFileContents, '<?php', '<?php nonexistantfunction();', 1))
              ).toBe(true);
        
        this.driver.get(utils.replaceWildCardsOnText("https://$host/$locale")).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                    .toContain('turbosite-global-error-manager-problem', 'Expected a php problem: exception to be shown on browser');
                
                expect(source)
                    .toContain('FATAL EXCEPTION', 'Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('Call to undefined function nonexistantfunction()', 'Expected a php problem: exception to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    it('should show warnings on browser for a site_php project type when warnings are enabled on setup', function(done) {
        
        this.turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(fm.saveFile(this.turbobuilderSetupPath, JSON.stringify(this.turbositeSetup))).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(this.homeViewFileContents, '<?php', '<?php $a=$b;', 1))
              ).toBe(true);
        
        this.driver.get(utils.replaceWildCardsOnText("https://$host/$locale")).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                    .toContain('turbosite-global-error-manager-problem', 'Expected a php problem: warning to be shown on browser');
                
                expect(source)
                    .toContain('E_NOTICE', 'Expected a php problem: warning to be shown on browser');
            
                expect(source)
                    .toContain('Undefined variable: b', 'Expected a php problem: warning to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    it('should show both errors and warnings on browser for a site_php project type when errors and warnings are enabled on setup', function(done) {
        
        this.turbositeSetup.errorSetup.exceptionsToBrowser = true;
        this.turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(fm.saveFile(this.turbobuilderSetupPath, JSON.stringify(this.turbositeSetup))).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(this.homeViewFileContents, '<?php', '<?php $a=$b; nonexistantfunction();', 1))
              ).toBe(true);
        
        this.driver.get(utils.replaceWildCardsOnText("https://$host/$locale")).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                .toContain('turbosite-global-error-manager-problem', 'Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('FATAL EXCEPTION', 'Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('Call to undefined function nonexistantfunction()', 'Expected a php problem: exception to be shown on browser');
        
                expect(source)
                    .toContain('E_NOTICE', 'Expected a php problem: warning to be shown on browser');
            
                expect(source)
                    .toContain('Undefined variable: b', 'Expected a php problem: warning to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    it('should show multiple warnings on browser for a site_php project type when warnings are enabled on setup', function(done) {
        
        this.turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(fm.saveFile(this.turbobuilderSetupPath, JSON.stringify(this.turbositeSetup))).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(this.homeViewFileContents, '<?php', '<?php $a=$b; $a=$c; $a=$d;', 1))
              ).toBe(true);
        
        this.driver.get(utils.replaceWildCardsOnText("https://$host/$locale")).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                .toContain('turbosite-global-error-manager-problem', 'Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .toContain('E_NOTICE', 'Expected a php problem: warning to be shown on browser');
            
                expect(source)
                    .toContain('Undefined variable: b', 'Expected a php problem: warning to be shown on browser');
        
                expect(source)
                    .toContain('Undefined variable: c', 'Expected a php problem: warning to be shown on browser');
    
                expect(source)
                    .toContain('Undefined variable: d', 'Expected a php problem: warning to be shown on browser');
    
                return done();
            });
        });
    });
    
    
    it('should not show warnings on browser for a site_php project type when disabled in setup', function(done) {
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(this.homeViewFileContents, '<?php', '<?php $a=$b;', 1))
              ).toBe(true);
        
        this.driver.get(utils.replaceWildCardsOnText("https://$host/$locale")).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                    .not.toContain('turbosite-global-error-manager-problem', 'NOT Expected a php problem: warning to be shown on browser');
                
                expect(source)
                    .not.toContain('E_NOTICE', 'NOT Expected a php problem: warning to be shown on browser');
            
                expect(source)
                    .not.toContain('Undefined variable: b', 'NOT Expected a php problem: warning to be shown on browser');
        
                return done();
            });
        });
    });
    
    
    it('should not show errors on browser for a site_php project type when disabled in setup', function(done) {

        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(this.homeViewFileContents, '<?php', '<?php nonexistantfunction();', 1))
              ).toBe(true);
        
        this.driver.get(utils.replaceWildCardsOnText("https://$host/$locale")).then(() => {
            
            this.driver.getPageSource().then((source) => {
                
                expect(source)
                    .not.toContain('turbosite-global-error-manager-problem', 'NOT Expected a php problem: exception to be shown on browser');
                
                expect(source)
                    .not.toContain('FATAL EXCEPTION', 'NOT Expected a php problem: exception to be shown on browser');
            
                expect(source)
                    .not.toContain('Call to undefined function nonexistantfunction()', 'NOT Expected a php problem: exception to be shown on browser');
        
                return done();
            });
        });
    });
});