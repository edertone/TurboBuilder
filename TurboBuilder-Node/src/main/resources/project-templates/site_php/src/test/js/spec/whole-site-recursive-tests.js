#!/usr/bin/env node

'use strict';


/**
 * Executes a standard set of recursive website tests that scan the whole site and all its links
 */

const utils = require('../sitephp-test-utils');
const { execSync } = require('child_process');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const { FilesManager } = require('turbodepot-node');
const fm = new FilesManager(require('fs'), require('os'), path, process);
const { AutomatedBrowserManager } = require('turbotesting-node');


describe('whole-site-recursive-tests', function() {


    beforeAll(function() {

        // HTTPManager class requires XMLHttpRequest which is only available on browser but not on node.
        // The xhr2 library emulates this class so it can be used on nodejs projects. We declare it globally here
        global.XMLHttpRequest = require('xhr2');
        
        // This value is set to disable the ssl bad certificate errors on nodejs
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager(execSync, webdriver, chrome, console, process);     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = utils.generateWildcards();
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.automatedBrowserManager.quit();
    });
    
    
    beforeEach(function() {

    });
    
    
    afterEach(function() {

    });
    
    
    it('should pass full website recursive tests', function(done) {
    
        this.automatedBrowserManager.assertWholeWebsite("https://$host/$locale/en", () => {
            
            done();
        });
    });
});