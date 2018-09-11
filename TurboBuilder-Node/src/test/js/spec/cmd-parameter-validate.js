#!/usr/bin/env node

'use strict';


/**
 * Tests related to the validate feature of the cmd app
 */


const utils = require('../test-utils');
const setupModule = require('./../../../main/js/setup');


describe('cmd-parameter-validate', function() {
    
    beforeEach(function() {
        
        this.workdir = utils.createAndSwitchToTempFolder('test-validate');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });

    
    it('should validate ok a newly generated lib_php project', function() {

        expect(utils.exec('-g lib_php')).toContain("Generated project structure ok");
        
        expect(utils.exec('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok a newly generated lib_js project', function() {

        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        expect(utils.exec('-l')).toContain("validate ok");
    });
    
    
    it('should fail on a lib_js project with a turbobuilder file with unexpected field', function() {
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        setup.build.lib_js.invalidField = 'invalid';
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain('additionalProperty "invalidField" exists in instance when not allowed');
    });

    
    it('should validate ok a newly generated lib_ts project', function() {

        expect(utils.exec('-g lib_php')).toContain("Generated project structure ok");
        
        expect(utils.exec('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok a newly generated site_php project', function() {

        expect(utils.exec('-g lib_php')).toContain("Generated project structure ok");
        
        let buildResult = utils.exec('-l');
        expect(buildResult).toContain("validate start");
        expect(buildResult).toContain("validate ok");
    });
    
    
    it('should validate by default before build on a generated lib_php project', function() {
        
        expect(utils.exec('-g lib_php')).toContain("Generated project structure ok");
        
        expect(utils.saveToSetupFile({metadata: {builderVersion: setupModule.getBuilderVersion()}, build: {lib_php: {}}}))
            .toBe(true);
        
        expect(utils.fm.saveFile('./src/main/php/autoloader.php', '<?php ?>')).toBe(true);

        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("build ok");
    });

    
    it('should validate by default before build on a generated lib_ts project', function() {
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        expect(utils.saveToSetupFile({metadata: {builderVersion: setupModule.getBuilderVersion()}, build: {lib_ts: {}}}))
            .toBe(true);
        
        expect(utils.fm.saveFile('./src/main/ts/index.ts', '')).toBe(true);

        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("Webpack ES5 ok");
        expect(buildResult).toContain("build ok");
    });
    
    
    it('should validate by default before build on a generated site_php project', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.saveToSetupFile({metadata: {builderVersion: setupModule.getBuilderVersion()}, build: {site_php: {}}}))
            .toBe(true);
        
        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("build ok");
    });
    
    
    it('should not validate two times if runBeforeBuild is enabled on a generated site_php project and -bl options are passed', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.saveToSetupFile({metadata: {builderVersion: setupModule.getBuilderVersion()}, build: {site_php: {}}}))
            .toBe(true);
        
        let buildResult = utils.exec('-bl');
        
        expect(buildResult).not.toContain("validate start");
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("build ok");
        
        let buildResult2 = utils.exec('-lb');
        
        expect(buildResult2).not.toContain("validate start");
        expect(buildResult2).toContain("validate ok");
        expect(buildResult2).toContain("build ok");
    });
    
    
    it('should fail if only a setup file exists on the folder', function() {
        
        expect(utils.saveToSetupFile({metadata: {builderVersion: setupModule.getBuilderVersion()}, 
            build: {lib_ts: {}},
            validate: {runBeforeBuild: false}}))
                .toBe(true);

        expect(utils.exec('-b')).toContain("no files to build");
    });
    
    
    it('should not validate before build when disabled in setup', function() {
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        expect(utils.saveToSetupFile({metadata: {builderVersion: setupModule.getBuilderVersion()}, 
            build: {lib_ts: {}},
            validate: {runBeforeBuild: false}}))
                .toBe(true);

        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain("build ok");
        expect(buildResult).not.toContain("validate ok");
    });
    

    it('should validate copyright headers when enabled in setup and all project files have valid headers except an excluded one', function() {
    
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setupFile = {
                metadata: {
                    builderVersion: setupModule.getBuilderVersion()
                }, 
                build: {
                    lib_ts: {
                    }
                },
                validate: {
                    runBeforeBuild: false,
                    copyrightHeaders: [
                        {
                            "path": "extras/copyright headers/TsFiles-Header.txt",
                            "appliesTo": "src",
                            "includes": ["ts"],
                            "excludes": ["file3"]
                        }
                    ]
                }
            };
        
        utils.saveToSetupFile(setupFile);
        
        // Create the copyright header template
        expect(utils.fm.createDirectory('./extras/copyright headers')).toBe(true);
        expect(utils.fm.saveFile('./extras/copyright headers/TsFiles-Header.txt', "/* this header is correct */\n")).toBe(true);
        
        // Add the correct header to all existing ts files on the generated project structure
        let tsFiles = utils.fm.findDirectoryItems('./', /.*\.ts$/i, 'absolute');
     
        for(let tsFile of tsFiles){
            
            expect(utils.fm.saveFile(tsFile, "/* this header is correct */\n\n\nand some more text")).toBe(true);
        }
 
        // Add some files with the right header
        expect(utils.fm.saveFile('./src/main/ts/index.ts', "/* this header is correct */\n\n\nand some more text")).toBe(true);
        expect(utils.fm.saveFile('./src/main/ts/file1.ts', "/* this header is correct */\n\n\nmore text here")).toBe(true);
        expect(utils.fm.saveFile('./src/main/ts/file2.ts', "/* this header is correct */\n\n\neven more text")).toBe(true);
        expect(utils.fm.saveFile('./src/main/ts/file3.ts', "/* this header is not correct */\n\n\neven more text")).toBe(true);
   
        // Test that headers are correctly validated
        expect(utils.exec('-l')).toContain("validate ok");
        
        // Test that headers are not correctly validated when file 3 is not excluded
        setupFile.validate.copyrightHeaders[0].excludes = [];
        
        utils.saveToSetupFile(setupFile);
        
        let buildResult = utils.exec('-l');
            
        expect(buildResult).toContain("Bad copyright header:");
        expect(buildResult).toContain("file3.ts");
        expect(buildResult).toContain("Must be as defined in extras/copyright headers/TsFiles-Header.txt");
        expect(buildResult).not.toContain("validate ok");
        
        // Add a file with bad header
        expect(utils.fm.createDirectory('./src/main/ts/somefolder')).toBe(true);
        expect(utils.fm.saveFile('./src/main/ts/somefolder/file4.ts', "/* this heade1r is correct */\n\n\neven more text")).toBe(true);
      
        // Test that headers are correctly validated
        expect(utils.exec('-l')).toContain("file4.ts");
    });
    
    
    it('should fail on a site_php project with a missing turbobuilder setup file', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.fm.deleteFile('.' + utils.fm.dirSep() + global.fileNames.setup)).toBe(true);        
        
        expect(utils.exec('-l')).toContain(global.fileNames.setup + ' setup file not found');
    });
    
    
    it('should fail on a site_php project with a turbobuilder file with unexpected field', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        setup.unexpected = 'unexpected';
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain('additionalProperty "unexpected" exists in instance when not allowed');
    });

    
    it('should fail on a site_php project with a missing turbosite setup file', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.fm.deleteFile('.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup)).toBe(true);        
        
        expect(utils.exec('-l')).toContain("Could not find " + global.fileNames.turboSiteSetup + " at ");
    });

    
    it('should fail on a site_php project with a turbosite file with missing homeView field', function() {
            
        let turboSiteSetupPath = '.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup;
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let turboSiteSetup = JSON.parse(utils.fm.readFile(turboSiteSetupPath));       
        expect(turboSiteSetup.homeView).toBe('home');        
        delete turboSiteSetup.homeView;
        
        expect(utils.fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        
        expect(utils.exec('-l')).toContain('instance requires property "homeView"');
    });
    
    
    it('should fail on a site_php project with a turbosite file with missing locales field', function() {
        
        let turboSiteSetupPath = '.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup;
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");     
        let turboSiteSetup = JSON.parse(utils.fm.readFile(turboSiteSetupPath));   
        delete turboSiteSetup.locales;
        
        expect(utils.fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        
        expect(utils.exec('-l')).toContain('instance requires property "locales"');
    });
    
    
    it('should fail on a site_php project with a turbosite file with missing globalJs field', function() {
        
        let turboSiteSetupPath = '.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup;
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");     
        let turboSiteSetup = JSON.parse(utils.fm.readFile(turboSiteSetupPath));   
        delete turboSiteSetup.globalJs;
        
        expect(utils.fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        
        expect(utils.exec('-l')).toContain('instance requires property "globalJs"');
    });


    it('should fail on a site_php project with a turbosite file with unexpected field', function() {
        
        let turboSiteSetupPath = '.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup;
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        let turboSiteSetup = JSON.parse(utils.fm.readFile(turboSiteSetupPath));
        turboSiteSetup.unexpectedValue = 'some value';
        
        expect(utils.fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        
        expect(utils.exec('-l')).toContain('additionalProperty "unexpectedValue" exists in instance when not allowed');
    });
    
    
    it('should validate ok if replaceVersion is missing on turbosite setup.build for a lib_js project type', function() {
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        delete setup.build.replaceVersion;
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("validate ok");
    });
});
