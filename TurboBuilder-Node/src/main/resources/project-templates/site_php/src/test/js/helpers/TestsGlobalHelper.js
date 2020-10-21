'use strict';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;
        
try {
    
    // Test that node_modules is installed by checking one of the custom modules (turbocommons)
    require.resolve("turbocommons-ts");
    
} catch(e) {
    
    console.log('\x1b[31m%s\x1b[0m', "Error: turbocommons-ts module not found. Did you run npm ci or npm install?");
    process.exit(1);
}