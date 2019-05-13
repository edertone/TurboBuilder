#!/usr/bin/env node

'use strict';


/**
 * Executes a standard set of recursive website tests that scan the whole site and all its links
 */

const utils = require('../sitephp-test-utils');
const { execSync } = require('child_process');
const webdriver = require('selenium-webdriver');
const { AutomatedBrowserManager } = require('turbotesting-node');
const { FilesManager } = require('turbodepot-node');
const chrome = require('selenium-webdriver/chrome');
const fm = new FilesManager();


describe('whole-site-recursive-tests', function() {


    beforeAll(function() {
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager(execSync, webdriver, chrome);     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = utils.generateWildcards();
    });

    
    afterAll(function() {
        
        this.automatedBrowserManager.quit();

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
    });
    
    
    it('should pass full website recursive tests', function(done) {
    
        this.automatedBrowserManager.assertWholeWebsite("https://$host/$locale/en", () => {
            
            done();
        });
    });
});