#!/usr/bin/env node

'use strict';


/**
 * Tests that check a list of urls that must load correctly
 */

const utils = require('../sitephp-test-utils');
const { execSync } = require('child_process');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { FilesManager } = require('turbodepot-node');
const path = require('path');
const fm = new FilesManager(require('fs'), require('os'), path, process);
const { AutomatedBrowserManager } = require('turbotesting-node');


describe('expected-200-ok', function() {

    beforeAll(function() {
        
        this.automatedBrowserManager = new AutomatedBrowserManager(execSync, webdriver, chrome, console, process);     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = utils.generateWildcards();
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.automatedBrowserManager.quit();
    });
    
    
    it('should show 200 ok result with urls defined in expected-200-ok.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/selenium-site_php-core-tests/expected-200-ok.json'));
        
        this.automatedBrowserManager.assertUrlsLoadOk(list, () => {
            
            done();
        });
    });
});