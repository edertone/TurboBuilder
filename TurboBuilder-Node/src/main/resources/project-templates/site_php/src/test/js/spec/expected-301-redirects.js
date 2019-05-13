#!/usr/bin/env node

'use strict';


/**
 * Tests that check a list of urls that must perform a 301 redirect
 */

const utils = require('../sitephp-test-utils');
const { execSync } = require('child_process');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { FilesManager } = require('turbodepot-node');
const fm = new FilesManager();
const { AutomatedBrowserManager } = require('turbotesting-node');


describe('expected-301-redirects', function() {


    beforeAll(function() {
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25001;
        
        this.automatedBrowserManager = new AutomatedBrowserManager(execSync, webdriver, chrome);
        this.automatedBrowserManager.wildcards = utils.generateWildcards();     
        this.automatedBrowserManager.initializeChrome();
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.automatedBrowserManager.quit();
    });
    
    
    it('should redirect urls with 301 as defined in expected-301-redirects.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/expected-301-redirects.json'));
        
        this.automatedBrowserManager.assertUrlsRedirect(list, () => {
            
            done();
        });
    });
});