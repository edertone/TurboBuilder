'use strict';


/**
 * Contains tests that check urls which must not give a 200 ok result
 */

const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager } = require('turbotesting-node');

const fm = new FilesManager();


describe('expected-404-errors', function() {

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
    it('should correctly execute all the 404 expected error requests', async function() {
    
        let list = JSON.parse(fm.readFile('src/test/resources/expected-404-errors/expected-404-errors.json'));
        
        await this.automatedBrowserManager.assertUrlsFail(list);
    });
});