'use strict';


/**
 * Contains tests that check urls which must not give a 200 ok result
 */

const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager, TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


describe('expected-404-errors', function() {

    /* jscpd:ignore-start */
    beforeAll(async function() {
        
        this.syncDestPath = tsm.getSyncDestPath();
        this.syncDestViewFilePath = this.syncDestPath + '/site/view/views';
        
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
    
    
    it('should correctly show non css or js files when they are stored on a view called libs inside /site/view/views', async function() {
        
        this.automatedBrowserManager.ignoreConsoleErrors.push('favicon.ico - Failed to load resource');
        
        expect(fm.saveFile(this.syncDestViewFilePath + '/libs/test.txt', 'txtcode', false, true)).toBe(true);
        expect(fm.saveFile(this.syncDestViewFilePath + '/libs/test.svg', 'svgcode', false, true)).toBe(true);
        
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/view/views/libs/test.txt",
            "sourceHtmlContains": "txtcode"
        },{
            "url": "https://$host/site/view/views/libs/test.txt",
            "sourceHtmlContains": "txtcode"
        },{
            "url": "https://$host/view/views/libs/test.svg",
            "sourceHtmlContains": "svgcode"
        },{
            "url": "https://$host/site/view/views/libs/test.svg",
            "sourceHtmlContains": "svgcode"
        }]);
        
        this.automatedBrowserManager.ignoreConsoleErrors.pop();
        
        expect(fm.deleteFile(this.syncDestViewFilePath + '/libs/test.txt')).toBe(true);
        expect(fm.deleteFile(this.syncDestViewFilePath + '/libs/test.svg')).toBe(true);
    });
    
    
    it('should show a 404 error when accessing non js or css files inside the site/libs folder', async function() {
        
        this.automatedBrowserManager.ignoreConsoleErrors.push('favicon.ico - Failed to load resource');
        
        expect(fm.saveFile(this.syncDestPath + '/site/libs/test.js', 'jscode', false, false)).toBe(true);
        expect(fm.saveFile(this.syncDestPath + '/site/libs/test.txt', 'txtcode', false, false)).toBe(true);
        expect(fm.saveFile(this.syncDestPath + '/site/libs/test.svg', 'svgcode', false, false)).toBe(true);
        expect(fm.saveFile(this.syncDestPath + '/site/libs/somelib/test.js', 'jscode', false, true)).toBe(true);
        expect(fm.saveFile(this.syncDestPath + '/site/libs/somelib/test.txt', 'txtcode', false, true)).toBe(true);
        expect(fm.saveFile(this.syncDestPath + '/site/libs/somelib/test.svg', 'svgcode', false, true)).toBe(true);
                
        await this.automatedBrowserManager.assertUrlsFail([
            "https://$host/libs/test.txt",
            "https://$host/libs/test.svg",
            "https://$host/libs/somelib/test.txt",
            "https://$host/libs/somelib/test.svg",
            "https://$host/site/libs/test.txt",
            "https://$host/site/libs/test.svg",
            "https://$host/site/libs/somelib/test.txt",
            "https://$host/site/libs/somelib/test.svg"]);
        
        // Test also that js files can be correctly shown
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/libs/test.js",
            "sourceHtmlContains": "jscode"
        },{
            "url": "https://$host/libs/somelib/test.js",
            "sourceHtmlContains": "jscode"
        }]);
        
        this.automatedBrowserManager.ignoreConsoleErrors.pop();
        
        expect(fm.deleteFile(this.syncDestPath + '/site/libs/test.js')).toBe(true);
        expect(fm.deleteFile(this.syncDestPath + '/site/libs/test.txt')).toBe(true);
        expect(fm.deleteFile(this.syncDestPath + '/site/libs/test.svg')).toBe(true);
        expect(fm.deleteFile(this.syncDestPath + '/site/libs/somelib/test.js')).toBe(true);
        expect(fm.deleteFile(this.syncDestPath + '/site/libs/somelib/test.txt')).toBe(true);
        expect(fm.deleteFile(this.syncDestPath + '/site/libs/somelib/test.svg')).toBe(true); 
        expect(fm.deleteDirectory(this.syncDestPath + '/site/libs/somelib', true)).toBe(0);        
    });
});