'use strict';


/**
 * Tests that verifies the website views URL parameters behaviour
 */

const utils = require('../sitephp-test-utils');
const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager, TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


describe('view-url-parameters', function() {

    beforeAll(function() {
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
        this.automatedBrowserManager = new AutomatedBrowserManager();     
        this.automatedBrowserManager.initializeChrome();
        this.automatedBrowserManager.wildcards = utils.generateWildcards();
        
        // Define the path to the views root so we can copy all our test views there
        this.turbobuilderSetup = tsm.getSetup('turbobuilder');
        this.resourcesRootPath = './src/test/resources';
        this.viewsRootPath = this.turbobuilderSetup.sync.destPath + '/site/view/views';
        
        // Copy all the test views to the synced project
        let viewsToCopyList = fm.getDirectoryList(this.resourcesRootPath + '/view-url-parameters');
        
        for(let viewToCopyList of viewsToCopyList){
        
            fm.createDirectory(this.viewsRootPath + '/' + viewToCopyList);
        
            fm.copyDirectory(this.resourcesRootPath + '/view-url-parameters/' + viewToCopyList,
                this.viewsRootPath + '/' + viewToCopyList);   
        }
    });
    
    
    afterAll(function() {

        this.automatedBrowserManager.quit();
    });
    
    
    it('should throw a 404 error when the multi-params-all-mandatory view is called without all the mandatory parameters', function(done) {
        
        this.automatedBrowserManager.assertUrlsFail([
            "https://$host/$locale/multi-params-all-mandatory",
            "https://$host/$locale/multi-params-all-mandatory/param1",
            "https://$host/$locale/multi-params-all-mandatory/param1/param2"
        ], done);
    });
    
    
    it('should correctly load the multi-params-all-mandatory view when called with all the mandatory parameters', function(done) {
        
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/multi-params-all-mandatory/param1/param2/param3",
            "titleContains": "blabla",
            "sourceHtmlContains": "<p>param1param2param3</p>",
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlStartsWith": "<!--jscpd:ignore-start-->",
            "sourceHtmlEndsWith": "<!--jscpd:ignore-end-->",
            "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
        
        }], done);
    });
    
    
    it('should throw a 404 error when a view that has value a without default parameter is called without a value for it', function(done) {
        
        this.automatedBrowserManager.assertUrlsFail([
            "https://$host/$locale/multi-params-one-without-default-value/param1"
        ], done);
    });
    
    
    it('should redirect the multi-params to the three default parameter values when called without parameters', function(done) {
        
        this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/$locale/multi-parameters",
            "to": "https://$host/$locale/multi-parameters/default-param1/default-param2/default-param3"
        }], done);
    });
    
    
    it('should redirect the multi-params to the three default parameter values when called with extra unexpected parameters', function(done) {
        
        this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/$locale/multi-parameters/p1/p2/p3/p4/p5",
            "to": "https://$host/$locale/multi-parameters/p1/p2/p3"
        }], done);
    });
    
    
    it('should redirect the multi-params-one-without-default-value to the third param default value when first two ones are set', function(done) {
        
        this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/$locale/multi-params-one-without-default-value/param1/param2",
            "to": "https://$host/$locale/multi-params-one-without-default-value/param1/param2/default-param3"
        }], done);
    });
    
    
    it('should throw 404 error when calling a typed parameters view with wrong type parameter values', function(done) {
        
        this.automatedBrowserManager.assertUrlsFail([
            "https://$host/$locale/multi-params-typed/param1",
            "https://$host/$locale/multi-params-typed/param1/param2/",
            "https://$host/$locale/multi-params-typed/123/123/",
            "https://$host/$locale/multi-params-typed/123/param2/string",
            "https://$host/$locale/multi-params-typed/a/\"param2\"/[1,2,3]",
            "https://$host/$locale/multi-params-typed/123/\"param2\"/1"
        ], done);
    });
    
    
    it('should correctly load a view with typed parameters', function(done) {
        
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/multi-params-typed/123/\"param2\"/[1,2,3]",
            "titleContains": "blabla",
            "sourceHtmlContains": ["<p>123param21-2-3</p>", "<p>integerstringarray</p>"],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlStartsWith": "<!--jscpd:ignore-start-->",
            "sourceHtmlEndsWith": "<!--jscpd:ignore-end-->",
            "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
        
        },{
            "url": "https://$host/$locale/multi-params-typed/123/%22param2%22/[1,2,3]",
            "titleContains": "blabla",
            "sourceHtmlContains": ["<p>123param21-2-3</p>", "<p>integerstringarray</p>"],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlStartsWith": "<!--jscpd:ignore-start-->",
            "sourceHtmlEndsWith": "<!--jscpd:ignore-end-->",
            "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
        
        }], done);
    });
    
    
    it('should throw 404 error when trying to call a single parameter view as if it was a multi parameter view', function(done) {
    
        this.automatedBrowserManager.assertUrlsFail([
            "https://$host/$locale/single-parameter/param1",
            "https://$host/$locale/single-parameter/param1/param2"
        ], done);
    });
    
    
    it('should throw exception when single parameter view that has different name than the one which is defined at turbosite.json is initialized', function(done) {
    
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/single-parameter-with-wrong-call-to-geturlparam/param1",
            "sourceHtmlContains": ['turbosite-global-error-manager-problem',
                                   "Trying to initialize a view called &lt;single-parameter-with-wrong-call-to-geturlparam&gt; as single param view, but &lt;single-parameter&gt; is the one configured at turbosite.json"],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"]        
        }], done);
    });
    
    
    it('should throw exception when multi parameter view that calls getUrlParam with a non existant index is loaded', function(done) {
    
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/multi-params-call-to-geturlparams-nonexisting-index/p1/p2",
            "sourceHtmlContains": ['<p>p1</p>', '<p>p2</p>', 'turbosite-global-error-manager-problem',
                                   "Disabled parameter URL index 2 requested"],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"]        
        }], done);
    });


    it('should throw exception when single parameter view contains a call to getUrlParam with a wrong URL param index', function(done) {
    
        // Replace the single param view at the synced project with the corrputed one, so we can call it to perform our test
        let singleParamViewContentBackup = fm.readFile(this.viewsRootPath + '/single-parameter/single-parameter.php');
        
        fm.copyFile(this.resourcesRootPath + '/view-url-parameters/single-parameter-with-wrong-call-to-geturlparam/single-parameter-with-wrong-call-to-geturlparam.php',
                    this.viewsRootPath + '/single-parameter/single-parameter.php');
    
        this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/param1",
            "sourceHtmlContains": ["<p>param1</p>", "turbosite-global-error-manager-problem", "Single parameter view accepts only one parameter"],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"]        
        }], () => {
            
            // Restore the single param view with the original backup
            expect(fm.saveFile(this.viewsRootPath + '/single-parameter/single-parameter.php', singleParamViewContentBackup)).toBe(true);
            
            done();
        });
    });
});