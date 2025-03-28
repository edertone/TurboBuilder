'use strict';


/**
 * Tests that verifies the website views URL parameters behaviour
 */

const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager, TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


describe('view-url-parameters', function() {

    beforeAll(async function() {
        
        // Define the path to the views root so we can copy all our test views there
        this.syncDestPath = tsm.getPathToPublishFolder();
        this.testResourcesPath = './src/test/resources';
        this.syncDestViewsPath = this.syncDestPath + '/site/view/views';
        
        // Define the path to indexphp file so it can be altered by tests
        this.indexPhpPath = this.syncDestPath + '/site/index.php';
        
        // Copy all the test views to the synced project
        fm.copyDirectory(this.testResourcesPath + '/view-url-parameters', this.syncDestViewsPath, false);
    });
    
    
    beforeEach(async function() {
        
        this.automatedBrowserManager = await testsGlobalHelper.setupBeforeEach(new AutomatedBrowserManager());
    });
    
    
    afterEach(async function() {

        await this.automatedBrowserManager.quit();
    });
    
    
    it('should throw a 404 error when the multi-params-all-mandatory view is called without all the mandatory parameters', async function() {
        
        await this.automatedBrowserManager.assertUrlsFail([
            "https://$host/$locale/multi-params-all-mandatory",
            "https://$host/$locale/multi-params-all-mandatory/param1",
            "https://$host/$locale/multi-params-all-mandatory/param1/param2"
        ]);
    });
    
    
    it('should correctly load the multi-params-all-mandatory view when called with all the mandatory parameters', async function() {
        
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/multi-params-all-mandatory/param1/param2/param3",
            "titleContains": "blabla",
            "sourceHtmlContains": "<p>param1param2param3</p>",
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlStartsWith": "<!--jscpd:ignore-start-->",
            "sourceHtmlEndsWith": "<!--jscpd:ignore-end-->",
            "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
        }]);
    });
    
    
    it('should throw a 404 error when a view that has value a without default parameter is called without a value for it', async function() {
        
        await this.automatedBrowserManager.assertUrlsFail([
            "https://$host/$locale/multi-params-one-without-default-value/param1"
        ]);
    });
    
    
    it('should redirect the multi-params to the three default parameter values when called without parameters', async function() {
        
        await this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/$locale/multi-parameters",
            "to": "https://$host/$locale/multi-parameters/default-param1/default-param2/default-param3"
        }]);
    });
    
    
    it('should redirect the multi-params to the three default parameter values when called with extra unexpected parameters', async function() {
        
        await this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/$locale/multi-parameters/p1/p2/p3/p4/p5",
            "to": "https://$host/$locale/multi-parameters/p1/p2/p3"
        }]);
    });
    
    
    it('should redirect the multi-params-one-without-default-value to the third param default value when first two ones are set', async function() {
        
        await this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/$locale/multi-params-one-without-default-value/param1/param2",
            "to": "https://$host/$locale/multi-params-one-without-default-value/param1/param2/default-param3"
        }]);
    });
    
    
    it('should throw 404 error when calling a typed parameters view with wrong type parameter values', async function() {
        
        await this.automatedBrowserManager.assertUrlsFail([
            "https://$host/$locale/multi-params-typed/param1",
            "https://$host/$locale/multi-params-typed/param1/param2/",
            "https://$host/$locale/multi-params-typed/123/123/",
            "https://$host/$locale/multi-params-typed/123/param2/string",
            "https://$host/$locale/multi-params-typed/a/\"param2\"/[1,2,3]",
            "https://$host/$locale/multi-params-typed/123/\"param2\"/1"
        ]);
    });
    
    
    it('should correctly load a view with typed parameters', async function() {
        
        await this.automatedBrowserManager.assertUrlsLoadOk([{
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
        
        }]);
    });
    
    
    it('should throw 404 error when trying to call a single parameter view as if it was a multi parameter view', async function() {
    
        await this.automatedBrowserManager.assertUrlsFail([
            "https://$host/$locale/single-parameter/param1",
            "https://$host/$locale/single-parameter/param1/param2"
        ]);
    });
    
    
    it('should throw exception when single parameter view that has different name than the one which is defined at turbosite.json is initialized', async function() {
    
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/single-parameter-with-wrong-call-to-geturlparam/param1",
            "sourceHtmlContains": ['turbosite-global-error-manager-problem',
                                   "Trying to initialize a view called &lt;single-parameter-with-wrong-call-to-geturlparam&gt; as single param view, but &lt;single-parameter&gt; is the one configured at turbosite.json"],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"]        
        }]);
    });
    
    
    it('should throw exception when multi parameter view that calls getUrlParam with a non existant index is loaded', async function() {
    
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/multi-params-call-to-geturlparams-nonexisting-index/p1/p2",
            "sourceHtmlContains": ['<p>p1</p>', '<p>p2</p>', 'turbosite-global-error-manager-problem',
                                   "Disabled parameter URL index 2 requested"],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"]        
        }]);
    });


    it('should throw exception when single parameter view contains a call to getUrlParam with a wrong URL param index', async function() {
    
        // Replace the single param view at the synced project with the corrputed one, so we can call it to perform our test
        let singleParamViewContentBackup = fm.readFile(this.syncDestViewsPath + '/single-parameter/single-parameter.php');
        
        fm.copyFile(this.testResourcesPath + '/view-url-parameters/single-parameter-with-wrong-call-to-geturlparam/single-parameter-with-wrong-call-to-geturlparam.php',
                    this.syncDestViewsPath + '/single-parameter/single-parameter.php');
    
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/param1",
            "sourceHtmlContains": ["<p>param1</p>", "turbosite-global-error-manager-problem", "Single parameter view accepts only one parameter"],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"]        
        
        }]).then(() => {
            
            // Restore the single param view with the original backup
            expect(fm.saveFile(this.syncDestViewsPath + '/single-parameter/single-parameter.php', singleParamViewContentBackup)).toBe(true);
        });
    });
    
    
    it('should redirect a single parameter view url to the closest restricted parameter value when sending url parameter that does not match the required ones', async function() {
        
        // Change the home view at the index.php stored setup
        let setup = tsm.getSetupFromIndexPhp('turbosite', this.indexPhpPath);
        let previousSingleParameterView = setup.singleParameterView;
        
        setup.singleParameterView = 'single-parameter-with-restricted-values';
        
        tsm.saveSetupToIndexPhp(setup, 'turbosite', this.indexPhpPath);
        
        await this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/hel",
            "to": "https://$host/hello"
        },{
            "url": "https://$host/hell",
            "to": "https://$host/hello"
        },{
            "url": "https://$host/hello",
            "to": "https://$host/hello"
        },{
            "url": "https://$host/rld",
            "to": "https://$host/world"
        },{
            "url": "https://$host/fac",
            "to": "https://$host/facts"
        },{
            "url": "https://$host/facts",
            "to": "https://$host/facts"
        },{
            "url": "https://$host/stringui",
            "to": "https://$host/string"
        
        }]).then(() => {
            
            // It should show a 404 error when trying to call like a normal view a single parameter view with restricted
            // values that has redirectToClosest = true
            return this.automatedBrowserManager.assertUrlsFail([
                "https://$host/$locale/single-parameter-with-restricted-values",
                "https://$host/$locale/single-parameter-with-restricted-values/hello",
                "https://$host/$locale/single-parameter-with-restricted-values/hello/string"
            
            ]).then(() => {
                
                // Restore the previous setup home view
                setup.singleParameterView = previousSingleParameterView;
                tsm.saveSetupToIndexPhp(setup, 'turbosite', this.indexPhpPath);  
            }); 
        });
    });
    
    
    it('should redirect a view url to the closest restricted parameter values when sending url parameters which do not match any of the required ones', async function() {
        
        await this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/$locale/multi-params-non-typed-with-restricted-values/2/hell",
            "to": "https://$host/$locale/multi-params-non-typed-with-restricted-values/1/hello"
        },
        {
            "url": "https://$host/$locale/multi-params-non-typed-with-restricted-values/1/h",
            "to": "https://$host/$locale/multi-params-non-typed-with-restricted-values/1/hello"
        },
        {
            "url": "https://$host/$locale/multi-params-non-typed-with-restricted-values/10000/s",
            "to": "https://$host/$locale/multi-params-non-typed-with-restricted-values/1/string"
        },
        {
            "url": "https://$host/$locale/multi-params-non-typed-with-restricted-values/3/str",
            "to": "https://$host/$locale/multi-params-non-typed-with-restricted-values/3/string"
        },
        {
            "url": "https://$host/$locale/multi-params-non-typed-with-restricted-values/5/rld",
            "to": "https://$host/$locale/multi-params-non-typed-with-restricted-values/5/world"
        },
        {
            "url": "https://$host/$locale/multi-params-non-typed-with-restricted-values/blabla/werwer345orld",
            "to": "https://$host/$locale/multi-params-non-typed-with-restricted-values/1/world"
        }]);
    });
    
    
    it('should redirect a view url to the closest typed restricted parameter values when sending url parameters which do not match any of the required ones', async function() {
        
        await this.automatedBrowserManager.assertUrlsRedirect([{
            "url": "https://$host/$locale/multi-params-typed-with-restricted-values/false/3/%22hello%22",
            "to": "https://$host/$locale/multi-params-typed-with-restricted-values/false/3/%22hello%22"
        },{
            "url": "https://$host/$locale/multi-params-typed-with-restricted-values/false/3/%22hel%22",
            "to": "https://$host/$locale/multi-params-typed-with-restricted-values/false/3/%22hello%22"
        },{
            "url": "https://$host/$locale/multi-params-typed-with-restricted-values/true/2/%22wor%22",
            "to": "https://$host/$locale/multi-params-typed-with-restricted-values/false/1/%22world%22"
        },{
            "url": "https://$host/$locale/multi-params-typed-with-restricted-values/true/3/%22stringer%22",
            "to": "https://$host/$locale/multi-params-typed-with-restricted-values/false/3/%22string%22"
        },{
            "url": "https://$host/$locale/multi-params-typed-with-restricted-values/true/222",
            "to": "https://$host/$locale/multi-params-typed-with-restricted-values/false/1/%22world%22"
        }]);
    });
    
    
//    it('should fail loading a view url when sending url parameters which do not match any of the required ones and redirect to closest parameter is disabled', async function() {
//        
//        // TODO - this feature must be implemented. It is not currently available. All restricted parameters get redirected to the most similar value.
//    });
});