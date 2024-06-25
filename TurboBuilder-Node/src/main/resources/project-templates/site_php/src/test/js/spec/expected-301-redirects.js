'use strict';


/**
 * Tests that check a list of urls that must perform a 301 redirect
 */

const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager } = require('turbotesting-node');

const fm = new FilesManager();


describe('expected-301-redirects', function() {

    /* jscpd:ignore-start */
    beforeAll(async function() {
        
        // This tests need more time to execute, so we will increase the timeout
        this.jasmineTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
               
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;
        
        this.automatedBrowserManager = testsGlobalHelper.setupBrowser(new AutomatedBrowserManager());
    });


    beforeEach(async function() {
        
        await testsGlobalHelper.setupBeforeEach(this.automatedBrowserManager);
    });

    
    afterAll(async function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.jasmineTimeout;
        
        await this.automatedBrowserManager.quit();
    });
    
    /* jscpd:ignore-end */
    it('should redirect urls with 301 as defined in expected-301-redirects.json', async function() {
        
        let list = JSON.parse(fm.readFile('src/test/resources/expected-301-redirects/expected-301-redirects.json'));
        
        await this.automatedBrowserManager.assertUrlsRedirect(list);
    });
});