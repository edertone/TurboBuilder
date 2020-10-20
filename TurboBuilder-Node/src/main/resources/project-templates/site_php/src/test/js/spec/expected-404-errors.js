'use strict';


/**
 * Contains tests that check urls which must not give a 200 ok result
 */

const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager } = require('turbotesting-node');
const { TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


describe('expected-404-errors', function() {


    beforeAll(function() {

        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager();     
        this.automatedBrowserManager.wildcards = tsm.getWildcards();
    });

    
    afterAll(function() {

        this.automatedBrowserManager.quit();
    });
    
    
    it('should correctly execute all the 404 expected error requests', function(done) {
    
        let list = JSON.parse(fm.readFile('src/test/resources/expected-404-errors/expected-404-errors.json'));
        
        this.automatedBrowserManager.assertUrlsFail(list, () => {
            
            done();
        });
    });
});