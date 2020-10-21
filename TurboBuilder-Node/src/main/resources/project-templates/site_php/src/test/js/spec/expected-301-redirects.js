'use strict';


/**
 * Tests that check a list of urls that must perform a 301 redirect
 */

const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager } = require('turbotesting-node');
const { TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


describe('expected-301-redirects', function() {


    beforeAll(function() {
        
        this.automatedBrowserManager = new AutomatedBrowserManager();
        this.automatedBrowserManager.wildcards = tsm.getWildcards();     
        this.automatedBrowserManager.initializeChrome();
    });

    
    afterAll(function() {

        this.automatedBrowserManager.quit();
    });
    
    
    it('should redirect urls with 301 as defined in expected-301-redirects.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/resources/expected-301-redirects/expected-301-redirects.json'));
        
        this.automatedBrowserManager.assertUrlsRedirect(list, () => {
            
            done();
        });
    });
});