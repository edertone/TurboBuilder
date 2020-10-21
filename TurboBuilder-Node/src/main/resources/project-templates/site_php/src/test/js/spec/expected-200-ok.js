'use strict';


/**
 * Tests that check a list of urls that must load correctly
 */

const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager } = require('turbotesting-node');
const { TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


describe('expected-200-ok', function() {

    beforeAll(function() {
        
        this.automatedBrowserManager = new AutomatedBrowserManager();     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = tsm.getWildcards();
    });

    
    afterAll(function() {

        this.automatedBrowserManager.quit();
    });
    
    
    it('should show 200 ok result with urls defined in expected-200-ok.json', function(done) {
        
        let list = JSON.parse(fm.readFile('src/test/resources/expected-200-ok/expected-200-ok.json'));
        
        this.automatedBrowserManager.assertUrlsLoadOk(list, done);
    });
});