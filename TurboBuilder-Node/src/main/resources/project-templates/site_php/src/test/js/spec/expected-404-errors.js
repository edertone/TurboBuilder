#!/usr/bin/env node

'use strict';


/**
 * Contains tests that check urls which must not give a 200 ok result
 */

const utils = require('../sitephp-test-utils');
const { execSync } = require('child_process');
const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
const path = require('path');
const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager } = require('turbotesting-node');
const fm = new FilesManager(require('fs'), require('os'), path, process);


describe('expected-404-errors', function() {


    beforeAll(function() {

        // HTTPManager class requires XMLHttpRequest which is only available on browser but not on node.
        // The xhr2 library emulates this class so it can be used on nodejs projects. We declare it globally here
        global.XMLHttpRequest = require('xhr2');
        
        // This value is set to disable the ssl bad certificate errors on nodejs
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        
        this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager(execSync, webdriver, chrome, console, process);     
        this.automatedBrowserManager.wildcards = utils.generateWildcards();
    });

    
    afterAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
        
        this.automatedBrowserManager.quit();
    });
    
    
    it('should correctly execute all the 404 expected error requests', function(done) {
    
        let list = JSON.parse(fm.readFile('src/test/js/resources/selenium-site_php-core-tests/expected-404-errors.json'));
        
        this.automatedBrowserManager.assertUrlsFail(list, () => {
            
            done();
        });
    });
});