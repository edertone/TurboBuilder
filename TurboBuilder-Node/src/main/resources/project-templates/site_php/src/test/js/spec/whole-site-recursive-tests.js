'use strict';


/**
 * Executes a standard set of recursive website tests that scan the whole site and all its links
 */

const { AutomatedBrowserManager } = require('turbotesting-node');


describe('whole-site-recursive-tests', function() {


    beforeAll(async function() {
        
        this.automatedBrowserManager = testsGlobalHelper.setupBrowser(new AutomatedBrowserManager());
    });


    beforeEach(async function() {
        
        await testsGlobalHelper.setupBeforeEach(this.automatedBrowserManager);
    });

    
    afterAll(async function() {
        
        await this.automatedBrowserManager.quit();
    });
    
    
    it('should pass full website recursive tests', async function() {
    
        await this.automatedBrowserManager.assertWholeWebSite("https://$host/$locale/en");
    });
});