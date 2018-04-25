#!/usr/bin/env node

'use strict';


/**
 * Version feature tests
 */


require('./../../main/js/globals');
const utils = require('./index-utils');


let workDir = utils.switchToDirInsideTemp('test-validate');


utils.test("test-validate", "Create and switch to the tests folder", function(){

    utils.assertFolderEmpty(workDir);
});


utils.test("test-validate", "Generate new project and launch validation", function(){
    
    utils.assertExecContains('-g', "Failed -g argument", "Generated project structure ok");
    utils.assertExecContains('-l', "Failed validation", "validate ok");
});


utils.test("test-validate", "Validation is executed before build by default and fails with default config", function(){
    
    utils.assertExecFails('-b', "Nothing to build.", "Build should have failed with default setup values");
});


utils.test("test-validate", "Validation is executed before build by default when build works as expected", function(){
    
    utils.saveToSetupFile(workDir, {build: {ts: {enabled: true}}});
    
    utils.assertSaveFile(workDir + '/src/main/ts/index.ts', '');
    
    utils.assertExecContains('-b', "Failed validation", ["validate ok", "build ok"]);
});


utils.test("test-validate", "Validation is not executed before build by default when disabled in config", function(){
    
    utils.saveToSetupFile(workDir, {build: {ts: {enabled: true}}, validate: {runBeforeBuild: false}});
    
    utils.assertExecContains('-b', "Failed validation", ["build ok"], ["validate ok"]);
});


utils.test("test-validate", "modify project config to verify copyright headers, add some files with correct headers and launch validation", function(){

    let setup = {
        build: {
            ts: {
                enabled: true
            }
        },
        validate: {
            runBeforeBuild: false,
            copyrightHeaders: [
                {
                    "enabled": true,
                    "path": "extras/copyrightHeaders/TsFiles-Header.txt",
                    "appliesTo": "src",
                    "includes": ["ts"],
                    "excludes": ["file3"]
                }
            ]
        }
    };
    
    utils.saveToSetupFile(workDir, setup);
    
    // Create the copyright header template
    utils.assertCreateFolder(workDir + '/extras/copyrightHeaders');
    utils.assertSaveFile(workDir + '/extras/copyrightHeaders/TsFiles-Header.txt', "/* this header is correct */\n");
    
    // Add some files with the right header
    utils.assertSaveFile(workDir + '/src/main/ts/index.ts', "/* this header is correct */\n\n\nand some more text");
    utils.assertSaveFile(workDir + '/src/main/ts/file1.ts', "/* this header is correct */\n\n\nmore text here");
    utils.assertSaveFile(workDir + '/src/main/ts/file2.ts', "/* this header is correct */\n\n\neven more text");
    utils.assertSaveFile(workDir + '/src/main/ts/file3.ts', "/* this header is not correct */\n\n\neven more text");
    
    // Test that headers are correctly validated
    utils.assertExecContains('-l', "Failed validation", "validate ok");
});


utils.test("test-validate", "modify project config to verify copyright headers, add some files with INCORRECT headers and launch validation", function(){
    
    // Add a file with bad header
    utils.assertCreateFolder(workDir + '/src/main/ts/somefolder');
    utils.assertSaveFile(workDir + '/src/main/ts/somefolder/file4.ts', "/* this heade1r is correct */\n\n\neven more text");
        
    // Test that headers are correctly validated
    utils.assertExecFails('-l', "file4.ts", "validate should have failed");
});