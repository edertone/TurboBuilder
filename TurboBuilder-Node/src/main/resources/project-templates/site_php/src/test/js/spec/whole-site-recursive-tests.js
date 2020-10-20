'use strict';


/**
 * Executes a standard set of recursive website tests that scan the whole site and all its links
 */

const { AutomatedBrowserManager } = require('turbotesting-node');
const { TurboSiteTestsManager } = require('turbotesting-node');

const tsm = new TurboSiteTestsManager('./');


describe('whole-site-recursive-tests', function() {


    beforeAll(function() {
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager();     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = tsm.getWildcards();
    });

    
    afterAll(function() {
        
        this.automatedBrowserManager.quit();
    });
    
    
    it('should pass full website recursive tests', function(done) {
    
        this.automatedBrowserManager.assertWholeWebSite("https://$host/$locale/en", () => {
            
            done();
        });
    });
});