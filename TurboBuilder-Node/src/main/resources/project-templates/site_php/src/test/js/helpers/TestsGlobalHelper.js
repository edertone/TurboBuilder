'use strict';


// Test that node_modules is installed by checking one of the custom modules (turbocommons)
// and warn the user to use npm ci if necessary    
try {
    
    require.resolve("turbocommons-ts");
    
} catch(e) {
    
    console.log('\x1b[31m%s\x1b[0m', "Error: turbocommons-ts module not found. Did you run npm ci or npm install?");
    process.exit(1);
}


const { TurboSiteTestsManager } = require('turbotesting-node');


const tsm = new TurboSiteTestsManager('./');


jasmine.DEFAULT_TIMEOUT_INTERVAL = 45000;


/**
 * Helper that defines global methods to use with the tests
 * Helper modules are always executed once before all the tests run
 */
global.testsGlobalHelper = {
    

    /**
     * Set this to false if you want to see what is happening on the browser
     */
    isHeadless: true,
        
    
    /**
     * Global beforeeach method
     */
    setupBeforeEach: async function(automatedBrowserManager) {
              
        await automatedBrowserManager.initializeChrome('en', '', true, this.isHeadless);
                         
        automatedBrowserManager.wildcards = tsm.getWildcards();
        
        await automatedBrowserManager.setBrowserSizeAndPosition(1024, 768, 0, 0);
                
        return automatedBrowserManager;
    },
};
