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
    });


    beforeEach(async function() {
        
        this.automatedBrowserManager = await testsGlobalHelper.setupBeforeEach(new AutomatedBrowserManager());
    });
    
    
    afterEach(async function() {

        await this.automatedBrowserManager.quit();
    });

    
    afterAll(async function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = this.jasmineTimeout;
    });
    
    /* jscpd:ignore-end */
    it('should redirect urls with 301 as defined in expected-301-redirects.json', async function() {
        
        let list = JSON.parse(fm.readFile('src/test/resources/expected-301-redirects/expected-301-redirects.json'));
        
        await this.automatedBrowserManager.assertUrlsRedirect(list);
    });
});