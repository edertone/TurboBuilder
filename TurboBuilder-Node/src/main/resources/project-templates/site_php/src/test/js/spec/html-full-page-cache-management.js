'use strict';


/**
 * Tests related to the correct operation of the full html document page caching mechanism for the website views, which gets enabled by
 * the cacheLifeTime property on WebViewSetup
 */

const { FilesManager } = require('turbodepot-node');
const { StringUtils } = require('turbocommons-ts');
const { AutomatedBrowserManager } = require('turbotesting-node');
const { TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


describe('html-full-page-cache-management', function() {

    beforeAll(async function() {
        
        this.automatedBrowserManager = testsGlobalHelper.setupBrowser(new AutomatedBrowserManager());
        
        // Define used paths
        this.syncDestPath = tsm.getSyncDestPath();
        this.testResourcesPath = './src/test/resources';
        this.syncDestViewsPath = this.syncDestPath + '/site/view/views';
        this.viewsCacheFolder = this.syncDestPath + '/site/___views_cache___';
        
        // Copy all the test views to the synced project (we reuse the same views as the view-url-parameters tests)
        fm.copyDirectory(this.testResourcesPath + '/view-url-parameters', this.syncDestViewsPath, false);
    });
    
    
    beforeEach(async function() {
        
        await testsGlobalHelper.setupBeforeEach(this.automatedBrowserManager);
        
        // Delete the views cache folder if it exists on the published folder
        if(fm.isDirectory(this.viewsCacheFolder)){
            
            fm.deleteDirectory(this.viewsCacheFolder);
        }
        
        // views cache folder must not exist at the published folder
        expect(fm.isDirectory(this.syncDestPath + '/site')).toBe(true);
        expect(fm.isDirectory(this.viewsCacheFolder)).toBe(false);
    });
    
    
    afterEach(async function() {
        
        // Delete the views cache folder if it exists on the published folder
        if(fm.isDirectory(this.viewsCacheFolder)){
            
            fm.deleteDirectory(this.viewsCacheFolder);
        }
    });
    
    
    afterAll(async function() {
        
        await this.automatedBrowserManager.quit();
    });
    
    
    it('should not generate a cache hashed file when view cache is disabled and view is loaded by the browser', async function() {
        
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/multi-params-all-mandatory/param1/param2/param3",
            "sourceHtmlContains": "<p>param1param2param3</p>",
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
        
        }]).then(() => {
            
            // test that views cache folder still does not exist
            expect(fm.isDirectory(this.syncDestPath + '/site')).toBe(true);
            expect(fm.isDirectory(this.viewsCacheFolder)).toBe(false);
        });
    });
    
    
    it('should generate a cache file when view cache is enabled and view url loaded. Modifying the file content must alter the view url output', async function() {
        
        // Modify the multi parameters mandatory view so it enables full html page cache (infinite time)
        let viewPath = this.syncDestViewsPath + '/multi-params-all-mandatory/multi-params-all-mandatory.php';
        let viewContentBackup = fm.readFile(viewPath);
        
        fm.saveFile(viewPath, StringUtils.replace(viewContentBackup, '$webViewSetup->enabledUrlParams = 3;',
                '$webViewSetup->enabledUrlParams = 3;$webViewSetup->cacheLifeTime = 0;'));
        
        // Load the view with the enabled cache so the cache file is generated        
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale/multi-params-all-mandatory/param1/param2/param3",
            "sourceHtmlContains": "<p>param1param2param3</p>",
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
        
        }]).then(() => {
            
            // Check that only 1 cache file exists on cache folder
            let viewsCacheFolderList = fm.getDirectoryList(this.viewsCacheFolder);
            expect(viewsCacheFolderList.length).toBe(1);
            
            // test that cache file exists and contains the right code
            let cacheFilePath = this.viewsCacheFolder + '/' + viewsCacheFolderList[0];
            let cacheFileContent = fm.readFile(cacheFilePath);
            expect(cacheFileContent).toContain('<p>param1param2param3</p>');
            
            // Check that calling the same url again gives the same result as the first time
            return this.automatedBrowserManager.assertUrlsLoadOk([{
                "url": "https://$host/$locale/multi-params-all-mandatory/param1/param2/param3",
                "sourceHtmlContains": "<p>param1param2param3</p>",
                "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
                "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
            
            }]).then(() => {
                
                // test that cache file is exactly the same after the second time url load
                expect(cacheFileContent).toBe(fm.readFile(cacheFilePath));
                
                // Alter it so the output of the url gets also altered
                expect(fm.saveFile(cacheFilePath, 'abcdef')).toBe(true);
                
                return this.automatedBrowserManager.assertUrlsLoadOk([{
                    "url": "https://$host/$locale/multi-params-all-mandatory/param1/param2/param3",
                    "sourceHtmlStartsWith": "abcd",
                    "sourceHtmlEndsWith": "def",
                    "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"]
                
                }]).then(() => {
                    
                    // test that loading the url with different parameters works ok
                    return this.automatedBrowserManager.assertUrlsLoadOk([{
                        "url": "https://$host/$locale/multi-params-all-mandatory/param4/param5/param6",
                        "sourceHtmlContains": "<p>param4param5param6</p>",
                        "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
                        "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
                    
                    }]).then(() => {
                        
                        // test that loading the original url after deleting its cache file restores the original output
                        expect(fm.deleteFile(cacheFilePath)).toBe(true);
                        
                        return this.automatedBrowserManager.assertUrlsLoadOk([{
                            "url": "https://$host/$locale/multi-params-all-mandatory/param1/param2/param3",
                            "sourceHtmlContains": "<p>param1param2param3</p>",
                            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
                            "sourceHtmlNotContains": ['turbosite-global-error-manager-problem']
                        
                        }]).then(() => {
                            
                            // Check that only 2 cache files exist on cache folder
                            expect(fm.getDirectoryList(this.viewsCacheFolder).length).toBe(2);
                            
                            // Restore the view with the original backup
                            expect(fm.saveFile(viewPath, viewContentBackup)).toBe(true);
                        });
                    });
                });
            });
        });
    });
});