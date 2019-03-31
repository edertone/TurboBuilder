#!/usr/bin/env node

'use strict';


/**
 * TODO
 */

const utils = require('../sitephp-test-utils');
const { execSync } = require('child_process');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const { FilesManager } = require('turbodepot-node');
const fm = new FilesManager(require('fs'), require('os'), path, process);
const { AutomatedBrowserManager, ConsoleManager } = require('turbotesting-node');


describe('expected-301-redirects', function() {

    beforeAll(function() {
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager(execSync, webdriver, chrome, new ConsoleManager(console, process));     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = utils.generateUrlWildcards();
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.automatedBrowserManager.quit();
    });
    
    
    it('should redirect urls with 301 as defined in expected-301-redirects.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/selenium-site_php-core-tests/expected-301-redirects.json'));
        
        this.automatedBrowserManager.assertUrlsRedirect(list, () => {
            
            done();
        });
    });
});