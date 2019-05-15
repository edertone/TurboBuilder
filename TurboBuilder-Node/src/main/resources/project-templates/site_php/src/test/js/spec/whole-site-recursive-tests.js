#!/usr/bin/env node

'use strict';


/**
 * Executes a standard set of recursive website tests that scan the whole site and all its links
 */

const utils = require('../sitephp-test-utils');
const { AutomatedBrowserManager } = require('turbotesting-node');


describe('whole-site-recursive-tests', function() {


    beforeAll(function() {
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager();     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = utils.generateWildcards();
    });

    
    afterAll(function() {
        
        this.automatedBrowserManager.quit();
    });
    
    
    it('should pass full website recursive tests', function(done) {
    
        this.automatedBrowserManager.assertWholeWebsite("https://$host/$locale/en", () => {
            
            done();
        });
    });
});