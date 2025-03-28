'use strict';


/**
 * Executes a standard set of recursive website tests that scan the whole site and all its links
 */

const { AutomatedBrowserManager } = require('turbotesting-node');


describe('whole-site-recursive-tests', function() {


    beforeEach(async function() {
        
        this.automatedBrowserManager = await testsGlobalHelper.setupBeforeEach(new AutomatedBrowserManager());
    });


    afterEach(async function() {

        await this.automatedBrowserManager.quit();
    });
    
    
    it('should pass full website recursive tests', async function() {
    
        await this.automatedBrowserManager.assertWholeWebSite("https://$host/$locale/en");
    });
});