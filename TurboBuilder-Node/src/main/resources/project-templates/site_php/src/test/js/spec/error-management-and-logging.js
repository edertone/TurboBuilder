#!/usr/bin/env node

'use strict';


/**
 * Tests related to the correct operation of the error management turbosite feature
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const utils = require('../sitephp-test-utils');
const { execSync } = require('child_process');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager, TurboSiteProjectManager } = require('turbotesting-node');

const fm = new FilesManager(require('fs'), require('os'), path, process);
const tsm = new TurboSiteProjectManager(fs, os, path, process, crypto);


describe('error-management-and-logging', function() {

    beforeAll(function() {
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager(execSync, webdriver, chrome, console, process);     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = utils.generateWildcards();
    });
    
    
    beforeEach(function() {

        let turbobuilderSetup = JSON.parse(fm.readFile('turbobuilder.json'));        
        
        this.destPath = turbobuilderSetup.sync.destPath;
        this.indexPhpPath = turbobuilderSetup.sync.destPath + '/site/index.php';
        this.indexPhpBackup = fm.readFile(this.indexPhpPath);
        
        this.homeViewFilePath = turbobuilderSetup.sync.destPath + '/site/view/views/home/home.php';
        this.homeViewFileContentsBackup = fm.readFile(this.homeViewFilePath);
        
        this.serviceWithoutParamsPath = turbobuilderSetup.sync.destPath + '/site/services/example/ExampleServiceWithoutParams.php';
        this.serviceWithoutParamsContentsBackup = fm.readFile(this.serviceWithoutParamsPath);
        
        // Set the logs source on the turbodepot setup
        let turbodepotSetup = tsm.getSetupFromIndexPhp('turbodepot', this.indexPhpPath);
           
        turbodepotSetup.sources.fileSystem = [
            {
                "name": "logs_source",
                "path": this.destPath + '/logs'
            }
        ];
        turbodepotSetup.depots[0].logs.source = 'logs_source';
        expect(tsm.saveSetupToIndexPhp(turbodepotSetup, "turbodepot", this.indexPhpPath)).toBe(true);        
       
        // Make sure the logs folder exists and it is empty
        expect(fm.isDirectory(this.destPath + '/logs')).toBe(false);
        expect(fm.createDirectory(this.destPath + '/logs')).toBe(true);
        expect(fm.isDirectoryEmpty(this.destPath + '/logs')).toBe(true);
    });
    
    
    afterEach(function() {

        // Restore all the possibly altered files
        expect(fm.saveFile(this.indexPhpPath, this.indexPhpBackup)).toBe(true);
        expect(fm.saveFile(this.homeViewFilePath, this.homeViewFileContentsBackup)).toBe(true);
        expect(fm.saveFile(this.serviceWithoutParamsPath, this.serviceWithoutParamsContentsBackup)).toBe(true);
        
        // Delete the logs folder if it exists
        if(fm.isDirectory(this.destPath + '/logs')){
            
            expect(fm.deleteDirectory(this.destPath + '/logs', true)).toBe(true);
        }
    });
    
    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.automatedBrowserManager.quit();
    });
    
    
    it('should show errors on browser for a site_php project type when errors are enabled on setup', function(done) {
        
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);

        turbositeSetup.errorSetup.exceptionsToBrowser = true;
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php nonexistantfunction();', 1))
              ).toBe(true);
        
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "title": null,
            "source": ['turbosite-global-error-manager-problem',
                       'FATAL EXCEPTION',
                       'Call to undefined function nonexistantfunction()'],
            "skipLogsTest": true,
            "startWith": null,
            "endWith": null,
            "notContains": null
        
        }], () => {
            
            done();
        });
    });
    
    
    it('should show warnings on browser for a site_php project type when warnings are enabled on setup', function(done) {
        
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php $a=$b;', 1))
              ).toBe(true);
              
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "title": null,
            "source": ['turbosite-global-error-manager-problem',
                       'E_NOTICE',
                       'Undefined variable: b'],
            "startWith": null,
            "endWith": null,
            "notContains": null
        
        }], () => {
            
            done();
        });
    });
    
    
    it('should show both errors and warnings on browser for a site_php project type when errors and warnings are enabled on setup', function(done) {
        
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.exceptionsToBrowser = true;
        turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php $a=$b; nonexistantfunction();', 1))
              ).toBe(true);
              
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "title": null,
            "source": ['turbosite-global-error-manager-problem',
                       'FATAL EXCEPTION',
                       'Call to undefined function nonexistantfunction()',
                       'E_NOTICE',
                       'Undefined variable: b'],
            "skipLogsTest": true,
            "startWith": null,
            "endWith": null,
            "notContains": null
        
        }], () => {
            
            done();
        });
    });
    
    
    it('should show multiple warnings on browser for a site_php project type when warnings are enabled on setup', function(done) {
        
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.warningsToBrowser = true;
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php $a=$b; $a=$c; $a=$d;', 1))
              ).toBe(true);
        
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "title": null,
            "source": ['turbosite-global-error-manager-problem',
                       'E_NOTICE',
                       'Undefined variable: b',
                       'Undefined variable: c',
                       'Undefined variable: d'],
            "startWith": null,
            "endWith": null,
            "notContains": null
        
        }], () => {
            
            done();
        });
    });
    
    
    it('should not show warnings on browser for a site_php project type when disabled in setup', function(done) {
        
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.warningsToBrowser = false;
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php $a=$b;', 1))
              ).toBe(true);
              
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "title": null,
            "source": null,
            "startWith": null,
            "endWith": null,
            "notContains": ["turbosite-global-error-manager-problem",
                            "E_NOTICE",
                            "Undefined variable: b"]
        
        }], () => {
            
            done();
        });
    });
    
    
    it('should not show errors on browser for a site_php project type when disabled in setup', function(done) {

        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let homeViewFileContents = fm.readFile(this.homeViewFilePath);
        
        turbositeSetup.errorSetup.exceptionsToBrowser = false;
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(homeViewFileContents, '<?php', '<?php nonexistantfunction();', 1))
              ).toBe(true);
        
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "title": null,
            "source": null,
            "skipLogsTest": true,
            "startWith": null,
            "endWith": null,
            "notContains": ["turbosite-global-error-manager-problem",
                            "FATAL EXCEPTION",
                            "Call to undefined function nonexistantfunction()"]
        
        }], () => {
            
            done();
        });
    });
    
    
    it('should show errors and warnings on separate log files for a site_php project type when log errors are enabled on setup', function(done) {
        
        // Enable exceptions and warnings to log on turbosite setup
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        turbositeSetup.errorSetup.exceptionsToBrowser = true;
        turbositeSetup.errorSetup.warningsToBrowser = true;
        turbositeSetup.errorSetup.exceptionsToLog = 'php_errors';
        turbositeSetup.errorSetup.warningsToLog = 'php_warnings';
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
       
        // Generate a warning and an exception on home.php file
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(fm.readFile(this.homeViewFilePath), '<?php', '<?php $a = $b; nonexistantfunction();', 1))
              ).toBe(true);
        
        this.automatedBrowserManager.loadUrl("https://$host/$locale", (results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_NOTICE')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: b')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: FATAL EXCEPTION')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Call to undefined function nonexistantfunction()')).toBe(1);
            
            // Verify generated errors log
            expect(fm.isFile(this.destPath + '/logs/php_errors')).toBe(true);
            let logContents = fm.readFile(this.destPath + '/logs/php_errors');
            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION Call to undefined function nonexistantfunction()')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'home.php line 1')).toBe(1);
            
            // Verify generated warnings log
            expect(fm.isFile(this.destPath + '/logs/php_warnings')).toBe(true);
            logContents = fm.readFile(this.destPath + '/logs/php_warnings');
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: b')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'home.php line 1')).toBe(1);
            
            return done();
        });
    });
    
    
    it('should show errors and multiple warnings on the same log file for a site_php project type when log warnings and errors are enabled on setup', function(done) {
       
        // Enable exceptions and warnings to log on turbosite setup
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        turbositeSetup.errorSetup.exceptionsToBrowser = false;
        turbositeSetup.errorSetup.warningsToBrowser = false;
        turbositeSetup.errorSetup.exceptionsToLog = 'php_log';
        turbositeSetup.errorSetup.warningsToLog = 'php_log';
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
       
        // Generate 3 warnings and an exception on home.php file
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(fm.readFile(this.homeViewFilePath), '<?php', '<?php $a = $b; $c = $d; $e = $f; nonexistantfunction();', 1))
              ).toBe(true);
        
        this.automatedBrowserManager.loadUrl("https://$host/$locale", (results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'E_NOTICE')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: b')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: d')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: f')).toBe(0);
            
            expect(StringUtils.countStringOccurences(results.source, 'FATAL EXCEPTION')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'Call to undefined function nonexistantfunction()')).toBe(0);
            
            // Verify generated log
            expect(fm.isFile(this.destPath + '/logs/php_log')).toBe(true);
            let logContents = fm.readFile(this.destPath + '/logs/php_log');
            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION Call to undefined function nonexistantfunction()')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: b')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: d')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: f')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'home.php line 1')).toBe(4);
            
            return done();
        });
    });
    
    
    it('should not show errors or warnings on log for a site_php project type when log errors are disabled on setup', function(done) {
       
        // Enable exceptions and warnings to log on turbosite setup
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        turbositeSetup.errorSetup.exceptionsToBrowser = true;
        turbositeSetup.errorSetup.warningsToBrowser = true;
        turbositeSetup.errorSetup.exceptionsToLog = '';
        turbositeSetup.errorSetup.warningsToLog = '';
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
       
        // Generate 3 warnings and an exception on home.php file
        expect(fm.saveFile(this.homeViewFilePath,
               StringUtils.replace(fm.readFile(this.homeViewFilePath), '<?php', '<?php $a = $b; $c = $d; $e = $f; nonexistantfunction();', 1))
              ).toBe(true);
              
        this.automatedBrowserManager.loadUrl("https://$host/$locale", (results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_NOTICE')).toBe(3);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: b')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: d')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: f')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: FATAL EXCEPTION')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Call to undefined function nonexistantfunction()')).toBe(1);
            
            // Verify no log
            expect(fm.isFile(this.destPath + '/logs/php_log')).toBe(false);
            expect(fm.isDirectoryEmpty(this.destPath + '/logs')).toBe(true);
            
            return done();
        });
    });
    
    
    it('should show too much time warnings on log for a site_php project when script takes more time than the one defined on setup', function(done) {
       
        // Enable too much time warnings to log
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        turbositeSetup.errorSetup.exceptionsToBrowser = false;
        turbositeSetup.errorSetup.warningsToBrowser = true;
        turbositeSetup.errorSetup.exceptionsToLog = '';
        turbositeSetup.errorSetup.warningsToLog = 'timewarnings';
        turbositeSetup.errorSetup.tooMuchTimeWarning = 1;
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
       
        this.automatedBrowserManager.loadUrl("https://$host/$locale", (results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_WARNING')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Too much time used by script:')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'FATAL EXCEPTION')).toBe(0);
            
            // Verify log contains the time warning
            expect(fm.isFile(this.destPath + '/logs/timewarnings')).toBe(true);
            let logContents = fm.readFile(this.destPath + '/logs/timewarnings');

            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION')).toBe(0);
            expect(StringUtils.countStringOccurences(logContents, 'E_WARNING Too much time used by script:')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'tooMuchTimeWarning setup memory threshold is 1 ms')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, '.php line -')).toBe(1);
            
            // Make sure the log file is not accessible via URL
            this.automatedBrowserManager.loadUrl("https://$host/logs/timewarnings", (results) => {
               
                expect(results.title.indexOf('404 Not Found') >= 0 || results.title.indexOf('Error 404 page') >= 0)
                    .toBe(true, results.finalUrl + ' should throw 404 error');
                
                return done();
            });
        });
    });
    
    
    it('should show too much memory warnings on log for a site_php project when script takes more memory than the one defined on setup', function(done) {
       
        // Enable too much memory warnings to log
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        turbositeSetup.errorSetup.exceptionsToBrowser = false;
        turbositeSetup.errorSetup.warningsToBrowser = true;
        turbositeSetup.errorSetup.exceptionsToLog = '';
        turbositeSetup.errorSetup.warningsToLog = 'timewarnings';
        turbositeSetup.errorSetup.tooMuchMemoryWarning = 1;
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
       
        this.automatedBrowserManager.loadUrl("https://$host/$locale", (results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_WARNING')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Too much memory used by script:')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'FATAL EXCEPTION')).toBe(0);
            
            // Verify log contains the time warning
            expect(fm.isFile(this.destPath + '/logs/timewarnings')).toBe(true);
            let logContents = fm.readFile(this.destPath + '/logs/timewarnings');

            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION')).toBe(0);
            expect(StringUtils.countStringOccurences(logContents, 'E_WARNING Too much memory used by script:')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'tooMuchMemoryWarning setup memory threshold is 1 bytes')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, '.php line -')).toBe(1);
            
            return done();
        });
    });
        
    
    it('should show errors and warnings on browser and log files for a site_php project type when running a buggy web service and errors are enabled on setup', function(done) {
    
        let serviceWithoutParamsContents = fm.readFile(this.serviceWithoutParamsPath);
        
        // Enable exceptions and warnings to log on turbosite setup
        let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        turbositeSetup.errorSetup.exceptionsToBrowser = true;
        turbositeSetup.errorSetup.warningsToBrowser = true;
        turbositeSetup.errorSetup.exceptionsToLog = 'services_log.txt';
        turbositeSetup.errorSetup.warningsToLog = 'services_log.txt';
        expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.indexPhpPath)).toBe(true);
        
        // Add a warning and an exception on the service without parameters
        expect(fm.saveFile(this.serviceWithoutParamsPath,
               StringUtils.replace(serviceWithoutParamsContents,
                    'namespace project\\src\\main\\services\\example;',
                    'namespace project\\src\\main\\services\\example; $a = $x; \\nonexistantfunction();', 1))
              ).toBe(true);
        
        this.automatedBrowserManager.loadUrl("https://$host/api/site/example/example-service-without-params", (results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_NOTICE')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: x')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: FATAL EXCEPTION')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Call to undefined function nonexistantfunction()')).toBe(1);
            
            // Verify generated log
            expect(fm.isFile(this.destPath + '/logs/services_log.txt')).toBe(true);
            let logContents = fm.readFile(this.destPath + '/logs/services_log.txt');
            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION Call to undefined function nonexistantfunction()')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: x')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'line 3')).toBe(2);
            
            // Make sure the log file is not accessible via URL
            this.automatedBrowserManager.loadUrl("https://$host/logs/services_log.txt", (results) => {
            
                expect(results.title.indexOf('404 Not Found') >= 0 || results.title.indexOf('Error 404 page') >= 0)
                    .toBe(true, results.finalUrl + ' should throw 404 error');
                
                return done();
            });
        });
    });
});