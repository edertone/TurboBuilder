'use strict';


/**
 * Tests that check a list of urls that must load correctly
 */

const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager } = require('turbotesting-node');

const fm = new FilesManager();


describe('expected-200-ok', function() {

    /* jscpd:ignore-start */
    beforeAll(async function() {
        
        this.automatedBrowserManager = testsGlobalHelper.setupBrowser(new AutomatedBrowserManager());
    });


    beforeEach(async function() {
        
        await testsGlobalHelper.setupBeforeEach(this.automatedBrowserManager);
    });
    
    
    afterAll(async function() {

        await this.automatedBrowserManager.quit();
    });
    
    /* jscpd:ignore-end */
    it('should show 200 ok result with urls defined in expected-200-ok.json', async function() {
        
        let list = JSON.parse(fm.readFile('src/test/resources/expected-200-ok/expected-200-ok.json'));
        
        await this.automatedBrowserManager.assertUrlsLoadOk(list);
    });
});