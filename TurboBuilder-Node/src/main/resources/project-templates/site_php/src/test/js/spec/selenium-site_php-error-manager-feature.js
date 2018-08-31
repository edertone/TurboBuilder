#!/usr/bin/env node

'use strict';


/**
 * All those tests are check that a site_php project type works as expected.
 * Any site_php project that is up to date must pass all of these tests.
 * 
 * No multi browser is necessary as we are only testing url behaviours, so we will use only
 * the chromedriver for these tests. 
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
        
        this.homeViewFilePath = this.turbobuilderSetup.sync[0].destPath + '/site/view/views/home/home.php';
        this.homeViewFileContents = fm.readFile(this.homeViewFilePath);
    });
    
    
    afterEach(function() {

        // Restore the home view php file contents to the value it has before test was run
        expect(fm.saveFile(this.homeViewFilePath, this.homeViewFileContents)).toBe(true);
    });
    
    
    afterAll(function() {

        this.driver.quit(); 
    });
    
    
    it('should show errors on browser for a site_php project type when errors are enabled on setup', function(done) {
        
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
    
    
    it('should show warnings on browser for a site_php project type when errors are enabled on setup', function(done) {
        
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
    
    
    it('should show both errors and warnings on browser for a site_php project type when errors are enabled on setup', function(done) {
        
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
    
    
    it('should show multiple warnings on browser for a site_php project type when errors are enabled on setup', function(done) {
        
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
    
});