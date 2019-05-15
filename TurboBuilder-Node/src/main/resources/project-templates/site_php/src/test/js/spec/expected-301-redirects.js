#!/usr/bin/env node

'use strict';


/**
 * Tests that check a list of urls that must perform a 301 redirect
 */

const utils = require('../sitephp-test-utils');
const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager } = require('turbotesting-node');

const fm = new FilesManager();


describe('expected-301-redirects', function() {


    beforeAll(function() {
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager();
        this.automatedBrowserManager.wildcards = utils.generateWildcards();     
        this.automatedBrowserManager.initializeChrome();
    });

    
    afterAll(function() {

        this.automatedBrowserManager.quit();
    });
    
    
    it('should redirect urls with 301 as defined in expected-301-redirects.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/js/resources/expected-301-redirects.json'));
        
        this.automatedBrowserManager.assertUrlsRedirect(list, () => {
            
            done();
        });
    });
});