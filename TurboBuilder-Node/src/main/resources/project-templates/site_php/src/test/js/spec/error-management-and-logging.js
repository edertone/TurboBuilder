'use strict';


/**
 * Tests related to the correct operation of the error management turbosite feature
 */

const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { AutomatedBrowserManager, TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');


describe('error-management-and-logging', function() {

    beforeAll(async function() {
        
        this.automatedBrowserManager = testsGlobalHelper.setupBrowser(new AutomatedBrowserManager());
                
        // Define all required paths
        this.syncDestPath = tsm.getPathToPublishFolder();
        this.tmpLogsPath = tsm.getTargetPath() + '/logs/tmp-testlogs';
        this.syncDestIndexPhpPath = this.syncDestPath + '/site/index.php';
        this.syncDestHomeViewFilePath = this.syncDestPath + '/site/view/views/home/home.php';
        this.serviceWithoutParamsPath = this.syncDestPath + '/site/services/example/ExampleServiceWithoutParamsService.php';
        
        this.indexPhpBackup = fm.readFile(this.syncDestIndexPhpPath);
        this.homeViewFileContentsBackup = fm.readFile(this.syncDestHomeViewFilePath);
        this.serviceWithoutParamsContentsBackup = fm.readFile(this.serviceWithoutParamsPath);
        
        // Auxiliary method to restore all backed up files that may have been altered by the tests
        this.restoreAlteredFilesAndLogs = () => {
            
            expect(fm.saveFile(this.syncDestIndexPhpPath, this.indexPhpBackup)).toBe(true);
            expect(fm.saveFile(this.syncDestHomeViewFilePath, this.homeViewFileContentsBackup)).toBe(true);
            expect(fm.saveFile(this.serviceWithoutParamsPath, this.serviceWithoutParamsContentsBackup)).toBe(true);
            
            // Delete the logs folder if it exists
            if(fm.isDirectory(this.tmpLogsPath)){
                
                expect(fm.deleteDirectory(this.tmpLogsPath, true)).toBeGreaterThan(-1);
            }
        };
        
        // Auxiliary method to alter the homeview.php code (to inject warnings or errors)
        this.injectCodeIntoHomeView = (code) => {
            
            expect(fm.saveFile(this.syncDestHomeViewFilePath,
               StringUtils.replace(fm.readFile(this.syncDestHomeViewFilePath), '<?php', '<?php ' + code, 1))
              ).toBe(true);
        };
        
        // Auxiliary method to save the specified error and warnings setup values to the index php file turbosite setup
        // (Any value that is set to null won't be altered)
        this.defineExceptionsAndWarningsSetup = (exceptionsToBrowser = null,
                                                 warningsToBrowser = null,
                                                 exceptionsToLog = null,
                                                 warningsToLog = null,
                                                 tooMuchTimeWarning = null,
                                                 tooMuchMemoryWarning = null) => {
        
            let turbositeSetup = tsm.getSetupFromIndexPhp('turbosite', this.syncDestIndexPhpPath);
        
            if(exceptionsToBrowser !== null){
                
                turbositeSetup.errorSetup.exceptionsToBrowser = exceptionsToBrowser;
            }
            
            if(warningsToBrowser !== null){
                
                turbositeSetup.errorSetup.warningsToBrowser = warningsToBrowser;
            }
            
            if(exceptionsToLog !== null){
                
                turbositeSetup.errorSetup.exceptionsToLog = exceptionsToLog;
            }
            
            if(warningsToLog !== null){
                
                turbositeSetup.errorSetup.warningsToLog = warningsToLog;
            }
            
            if(tooMuchTimeWarning !== null){
                
                turbositeSetup.errorSetup.tooMuchTimeWarning = tooMuchTimeWarning;
            }
            
            if(tooMuchMemoryWarning !== null){
                
                turbositeSetup.errorSetup.tooMuchMemoryWarning = tooMuchMemoryWarning;
            }
            
            expect(tsm.saveSetupToIndexPhp(turbositeSetup, "turbosite", this.syncDestIndexPhpPath)).toBe(true);
        };
    });
    
    
    beforeEach(async function() {

        await testsGlobalHelper.setupBeforeEach(this.automatedBrowserManager);
        
        this.restoreAlteredFilesAndLogs();
        
        // Set the logs source on the turbodepot setup
        let turbodepotSetup = tsm.getSetupFromIndexPhp('turbodepot', this.syncDestIndexPhpPath);
           
        turbodepotSetup.sources.fileSystem = [
            {
                "name": "logs_source",
                "path": '/var/www/target/logs/tmp-testlogs'
            }
        ];
        turbodepotSetup.depots[0].logs.source = 'logs_source';
        expect(tsm.saveSetupToIndexPhp(turbodepotSetup, "turbodepot", this.syncDestIndexPhpPath)).toBe(true);        
        
        // Create the logs folder and make sure it exists and it is empty
        expect(fm.isDirectory(this.tmpLogsPath)).toBe(false);
        expect(fm.createDirectory(this.tmpLogsPath)).toBe(true);
        expect(fm.isDirectoryEmpty(this.tmpLogsPath)).toBe(true);
    });
    
    
    afterEach(async function() {

        this.restoreAlteredFilesAndLogs();
    });
    
    
    afterAll(async function() {

        await this.automatedBrowserManager.quit();
    });
    
    
    it('should show errors on browser for a site_php project type when errors are enabled on setup', async function() {
        
        this.defineExceptionsAndWarningsSetup(true);
        
        this.injectCodeIntoHomeView('nonexistantfunction();');
        
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "titleContains": null,
            "sourceHtmlContains": ['turbosite-global-error-manager-problem',
                       'FATAL EXCEPTION',
                       'Call to undefined function nonexistantfunction()'],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlStartsWith": null,
            "sourceHtmlEndsWith": null,
            "sourceHtmlNotContains": null
        
        }]);
    });
    
    
    it('should show warnings on browser for a site_php project type when warnings are enabled on setup', async function() {
        
        this.defineExceptionsAndWarningsSetup(null, true);
        
        this.injectCodeIntoHomeView('$a=$b;');
                      
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "titleContains": null,
            "sourceHtmlContains": ['turbosite-global-error-manager-problem',
                       'E_NOTICE',
                       'Undefined variable: b'],
            "sourceHtmlStartsWith": null,
            "sourceHtmlEndsWith": null,
            "sourceHtmlNotContains": null
        }]);
    });
    
    
    it('should show both errors and warnings on browser for a site_php project type when errors and warnings are enabled on setup', async function() {
        
        this.defineExceptionsAndWarningsSetup(true, true);
        
        this.injectCodeIntoHomeView('$a=$b; nonexistantfunction();');
                      
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "titleContains": null,
            "sourceHtmlContains": ['turbosite-global-error-manager-problem',
                       'E_NOTICE',
                       'Undefined variable: b',
                       'FATAL EXCEPTION',
                       'Call to undefined function nonexistantfunction()'],
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlStartsWith": null,
            "sourceHtmlEndsWith": null,
            "sourceHtmlNotContains": null
        }]);
    });
    
    
    it('should show multiple warnings on browser for a site_php project type when warnings are enabled on setup', async function() {
        
        this.defineExceptionsAndWarningsSetup(null, true);
        
        this.injectCodeIntoHomeView('$a=$b; $a=$c; $a=$d;');
        
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "titleContains": null,
            "sourceHtmlContains": ['turbosite-global-error-manager-problem',
                       'E_NOTICE',
                       'Undefined variable: b',
                       'Undefined variable: c',
                       'Undefined variable: d'],
            "sourceHtmlStartsWith": null,
            "sourceHtmlEndsWith": null,
            "sourceHtmlNotContains": null
        }]);
    });
    
    
    it('should not show warnings on browser for a site_php project type when disabled in setup', async function() {
        
        this.defineExceptionsAndWarningsSetup(null, false);
        
        this.injectCodeIntoHomeView('$a=$b;');
              
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "titleContains": null,
            "sourceHtmlContains": null,
            "sourceHtmlStartsWith": null,
            "sourceHtmlEndsWith": null,
            "sourceHtmlNotContains": ["turbosite-global-error-manager-problem",
                            "E_NOTICE",
                            "Undefined variable: b"]
        
        }]);
    });
    
    
    it('should not show errors on browser for a site_php project type when disabled in setup', async function() {

        this.defineExceptionsAndWarningsSetup(false);
        
        this.injectCodeIntoHomeView('nonexistantfunction();');
        
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            "url": "https://$host/$locale",
            "titleContains": null,
            "sourceHtmlContains": null,
            "ignoreConsoleErrors": ["favicon.ico - Failed to load resource"],
            "sourceHtmlStartsWith": null,
            "sourceHtmlEndsWith": null,
            "sourceHtmlNotContains": ["turbosite-global-error-manager-problem",
                            "FATAL EXCEPTION",
                            "Call to undefined function nonexistantfunction()"]
        
        }]);
    });
    
    
    it('should show errors and warnings on separate log files for a site_php project type when log errors are enabled on setup', async function() {
        
        // Enable exceptions and warnings to log on turbosite setup
        this.defineExceptionsAndWarningsSetup(true, true, 'php_errors', 'php_warnings');
       
        // Generate a warning and an exception on home.php file
        this.injectCodeIntoHomeView('$a = $b; nonexistantfunction();');
        
        await this.automatedBrowserManager.loadUrl("https://$host/$locale")
            .then((results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_NOTICE')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: b')).toBeGreaterThanOrEqual(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: FATAL EXCEPTION')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Call to undefined function nonexistantfunction()')).toBeGreaterThanOrEqual(1);
            
            // Verify generated errors log
            expect(fm.isFile(this.tmpLogsPath + '/php_errors')).toBe(true);
            let logContents = fm.readFile(this.tmpLogsPath + '/php_errors');
            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION Call to undefined function nonexistantfunction()')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'home.php line 1')).toBe(1);
            
            // Verify generated warnings log
            expect(fm.isFile(this.tmpLogsPath + '/php_warnings')).toBe(true);
            logContents = fm.readFile(this.tmpLogsPath + '/php_warnings');
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: b')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'home.php line 1')).toBe(1);
        });
    });
    
    
    it('should show errors and multiple warnings on the same log file for a site_php project type when log warnings and errors are enabled on setup', async function() {
       
        // Enable exceptions and warnings to log on turbosite setup
        this.defineExceptionsAndWarningsSetup(false, false, 'php_log', 'php_log');
       
        // Generate 3 warnings and an exception on home.php file
        this.injectCodeIntoHomeView('$a = $b; $c = $d; $e = $f; nonexistantfunction();');
        
        await this.automatedBrowserManager.loadUrl("https://$host/$locale")
            .then((results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'E_NOTICE')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: b')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: d')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: f')).toBe(0);
            
            expect(StringUtils.countStringOccurences(results.source, 'FATAL EXCEPTION')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'Call to undefined function nonexistantfunction()')).toBe(0);
            
            // Verify generated log
            expect(fm.isFile(this.tmpLogsPath + '/php_log')).toBe(true);
            let logContents = fm.readFile(this.tmpLogsPath + '/php_log');
            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION Call to undefined function nonexistantfunction()')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: b')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: d')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: f')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'home.php line 1')).toBe(4);
        });
    });
    
    
    it('should not show errors or warnings on log for a site_php project type when log errors are disabled on setup', async function() {
       
        // Enable exceptions and warnings to log on turbosite setup
        this.defineExceptionsAndWarningsSetup(true, true, '', '');
       
        // Generate 3 warnings and an exception on home.php file
        this.injectCodeIntoHomeView('$a = $b; $c = $d; $e = $f; nonexistantfunction();');
              
        await this.automatedBrowserManager.loadUrl("https://$host/$locale")
            .then((results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: FATAL EXCEPTION')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_NOTICE')).toBe(3);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: b')).toBeGreaterThanOrEqual(1);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: d')).toBeGreaterThanOrEqual(1);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: f')).toBeGreaterThanOrEqual(1);
            expect(StringUtils.countStringOccurences(results.source, 'Call to undefined function nonexistantfunction()')).toBeGreaterThanOrEqual(1);
            
            // Verify no log
            expect(fm.isFile(this.tmpLogsPath + '/php_log')).toBe(false);
            expect(fm.isDirectoryEmpty(this.tmpLogsPath)).toBe(true);
        });
    });
    
    
    it('should show too much time warnings on log for a site_php project when script takes more time than the one defined on setup', async function() {
       
        // Enable too much time warnings to log
        this.defineExceptionsAndWarningsSetup(false, true, '', 'timewarnings', 1);
        
        await this.automatedBrowserManager.loadUrl("https://$host/$locale")
            .then((results) => {
            
            // Verify log contains the time warning
            expect(fm.isFile(this.tmpLogsPath + '/timewarnings')).toBe(true);
            let logContents = fm.readFile(this.tmpLogsPath + '/timewarnings');

            expect(StringUtils.countStringOccurences(logContents, 'E_WARNING Too much time used by script:')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION')).toBe(0);
            expect(StringUtils.countStringOccurences(logContents, 'tooMuchTimeWarning setup memory threshold is 1 ms')).toBeGreaterThanOrEqual(1);
            expect(StringUtils.countStringOccurences(logContents, '.php line -')).toBe(1);
            
            expect(StringUtils.countStringOccurences(results.source, 'FATAL EXCEPTION')).toBe(0);
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_WARNING')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Too much time used by script:')).toBeGreaterThanOrEqual(1);

            // Make sure the log file is not accessible via URL
            return this.automatedBrowserManager.assertUrlsFail(["https://$host/logs/tmp-testlogs/timewarnings"]);
        });
    });
    
    
    it('should show too much memory warnings on log for a site_php project when script takes more memory than the one defined on setup', async function() {
       
        // Enable too much memory warnings to log
        this.defineExceptionsAndWarningsSetup(false, true, '', 'timewarnings', null, 1);
       
        await this.automatedBrowserManager.loadUrl("https://$host/$locale")
            .then((results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_WARNING')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Too much memory used by script:')).toBeGreaterThanOrEqual(1);
            expect(StringUtils.countStringOccurences(results.source, 'FATAL EXCEPTION')).toBe(0);
            
            // Verify log contains the time warning
            expect(fm.isFile(this.tmpLogsPath + '/timewarnings')).toBe(true);
            let logContents = fm.readFile(this.tmpLogsPath + '/timewarnings');

            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION')).toBe(0);
            expect(StringUtils.countStringOccurences(logContents, 'E_WARNING Too much memory used by script:')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'tooMuchMemoryWarning setup memory threshold is 1 bytes')).toBeGreaterThanOrEqual(1);
            expect(StringUtils.countStringOccurences(logContents, '.php line -')).toBe(1);
        });
    });
        
    
    it('should show errors and warnings on browser and log files for a site_php project type when running a buggy web service and errors are enabled on setup', async function() {
    
        let serviceWithoutParamsContents = fm.readFile(this.serviceWithoutParamsPath);
        
        // Enable exceptions and warnings to log on turbosite setup
        this.defineExceptionsAndWarningsSetup(true, true, 'services_log.txt', 'services_log.txt');
        
        // Add a warning and an exception on the service without parameters
        expect(fm.saveFile(this.serviceWithoutParamsPath,
               StringUtils.replace(serviceWithoutParamsContents,
                    'namespace project\\src\\main\\services\\example;',
                    'namespace project\\src\\main\\services\\example; $a = $x; \\nonexistantfunction();', 1))
              ).toBe(true);
        
        await this.automatedBrowserManager.loadUrl("https://$host/api/site/example/example-service-without-params")
            .then((results) => {
            
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: E_NOTICE')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'turbosite-global-error-manager-problem')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Undefined variable: x')).toBeGreaterThanOrEqual(1);
            expect(StringUtils.countStringOccurences(results.source, 'PHP Problem: FATAL EXCEPTION')).toBe(1);
            expect(StringUtils.countStringOccurences(results.source, 'Call to undefined function nonexistantfunction()')).toBeGreaterThanOrEqual(1);
            
            // Verify generated log
            expect(fm.isFile(this.tmpLogsPath + '/services_log.txt')).toBe(true);
            let logContents = fm.readFile(this.tmpLogsPath + '/services_log.txt');
            expect(StringUtils.countStringOccurences(logContents, 'FATAL EXCEPTION Call to undefined function nonexistantfunction()')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'E_NOTICE Undefined variable: x')).toBe(1);
            expect(StringUtils.countStringOccurences(logContents, 'line 3')).toBe(2);
            
            // Make sure the log file is not accessible via URL
            return this.automatedBrowserManager.assertUrlsFail(["https://$host/logs/tmp-testlogs/services_log.txt"]);
        });
    });
});