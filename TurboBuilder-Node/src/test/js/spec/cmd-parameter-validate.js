#!/usr/bin/env node

'use strict';


/**
 * Tests related to the validate feature of the cmd app
 */


const utils = require('../cmd-parameter-test-utils');
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
        
        // Test that no validate.php section exists
        expect(setup.validate.hasOwnProperty('php')).toBe(false); 
        
        setup.build.lib_js.invalidField = 'invalid';
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain('additionalProperty "invalidField" exists in instance when not allowed');
    });
    
    
    it('should fail validate for javascript files that do not contain the use strict modifier', function() {
    
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        expect(utils.exec('-l')).toContain("validate ok");
        
        expect(utils.fm.saveFile('./src/main/test.js', "does not begin with use strict")).toBe(true);
         
        expect(utils.exec('-l')).toContain('File must start with "use strict":');
        
        // Disable use strict validation on setup and test that it now validates
        let setup = utils.readSetupFile();
        
        setup.validate.javascript.useStrict = {
                "enabled": false,
                "includes": [".js"],
                "excludes": ["src/main/libs"]
            };
        
        utils.saveToSetupFile(setup);
        
        expect(utils.exec('-l')).toContain("validate ok");
        
        // Enable again the use strict validation on setup but ignore the bad file
        setup.validate.javascript.useStrict = {
                "enabled": true,
                "includes": [".js"],
                "excludes": ["test.js"]
            };
        
        utils.saveToSetupFile(setup);
        
        expect(utils.exec('-l')).toContain("validate ok");
    });

    
    it('should validate ok a newly generated lib_ts project', function() {

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        expect(utils.exec('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok a newly generated site_php project', function() {

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let buildResult = utils.exec('-l');
        expect(buildResult).toContain("validate start");
        expect(buildResult).toContain("validate ok");
    });
    
    
    it('should fail validaton on a newly generated site_php project with an empty turbobuilder setup', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.saveToSetupFile({})).toBe(true);
        
        expect(utils.exec('-l')).toContain("No valid project type specified. Please enable any of");
    });
    
    
    it('should fail validaton on a newly generated site_php project with a turbobuilder setup containing only $schema and metadata', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        expect(utils.saveToSetupFile({"$schema": setup.$schema, metadata: {builderVersion: setupModule.getBuilderVersion()}}))
            .toBe(true);
        
        expect(utils.exec('-l')).toContain("No valid project type specified. Please enable any of");    
    });

    
    it('should validate ok a newly generated site_php project with a turbobuilder setup containing only $schema, metadata and build', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        expect(utils.saveToSetupFile({"$schema": setup.$schema, 
            metadata: {
                name: '',
                description: '',
                builderVersion: setupModule.getBuilderVersion()
            },
            build: {site_php: {}}}))
                .toBe(true);
        
        expect(utils.exec('-l')).toContain("validate ok");  
    });
    
    
    it('should validate by default before build on a generated lib_php project', function() {
        
        expect(utils.exec('-g lib_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        expect(utils.saveToSetupFile({"$schema": setup.$schema, metadata: {builderVersion: setupModule.getBuilderVersion()}, build: {lib_php: {}}}))
            .toBe(true);
        
        expect(utils.fm.saveFile('./src/main/php/autoloader.php', '<?php ?>')).toBe(true);

        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("build ok");
    });

    
    it('should validate by default before build on a generated lib_ts project', function() {
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        expect(utils.saveToSetupFile({"$schema": setup.$schema, metadata: {builderVersion: setupModule.getBuilderVersion()}, build: {lib_ts: {}}}))
            .toBe(true);
        
        expect(utils.fm.saveFile('./src/main/ts/index.ts', '')).toBe(true);

        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("Webpack ES5 ok");
        expect(buildResult).toContain("build ok");
    });
    
    
    it('should validate by default before build on a generated site_php project', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        expect(utils.saveToSetupFile({"$schema": setup.$schema, 
            metadata: {
                name: '',
                description: '',
                builderVersion: setupModule.getBuilderVersion()
            },
            build: {site_php: {}}}))
                .toBe(true);
        
        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("build ok");
    });
    
    
    it('should not validate two times if runBeforeBuild is enabled on a generated site_php project and -bl options are passed', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        
        expect(utils.saveToSetupFile({"$schema": setup.$schema, 
            metadata: {
                name: '',
                description: '',
                builderVersion: setupModule.getBuilderVersion()
            },
            build: {site_php: {}}}))
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
        
        expect(utils.saveToSetupFile({"$schema": "", metadata: {builderVersion: setupModule.getBuilderVersion()}, 
            build: {lib_ts: {}},
            validate: {runBeforeBuild: false}}))
                .toBe(true);

        expect(utils.exec('-b')).toContain("no files to build");
    });
    
    
    it('should not validate before build when disabled in setup', function() {
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        
        expect(utils.saveToSetupFile({"$schema": setup.$schema, metadata: {builderVersion: setupModule.getBuilderVersion()}, 
            build: {lib_ts: {}},
            validate: {runBeforeBuild: false}}))
                .toBe(true);

        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain("build ok");
        expect(buildResult).not.toContain("validate ok");
    });
    
    
    it('should fail validation if copyright headers file template is not found', function() {
    
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        
        setup.validate.filesContent.copyrightHeaders = [
                        {
                            "path": "extras/copyright headers/nonexistantfile.txt",
                            "appliesTo": "src",
                            "includes": ["ts"],
                            "excludes": ["file3"]
                        }
                    ];
        
        utils.saveToSetupFile(setup);
        
        let execResult = utils.exec('-l');
        
        expect(execResult).toContain("Copyrhight headers template not found");
        expect(execResult).toContain("nonexistantfile.txt");
    });
    
    
    it('should validate copyright headers when enabled in setup and all project files have valid headers except an excluded one', function() {
    
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        
        let setupFile = {
                "$schema": setup.$schema,
                metadata: {
                    builderVersion: setupModule.getBuilderVersion()
                }, 
                build: {
                    lib_ts: {
                    }
                },
                validate: {
                    runBeforeBuild: false,
                    filesContent: {
                        copyrightHeaders: [
                            {
                                "path": "extras/copyright headers/TsFiles-Header.txt",
                                "appliesTo": "src",
                                "includes": ["ts"],
                                "excludes": ["file3"]
                            }
                        ]
                    }
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
        setupFile.validate.filesContent.copyrightHeaders[0].excludes = [];
        
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
    
    
    it('should corectly detect files that match the includes list on copyrightHeaders setup', function() {
    
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        
        setup.validate.filesContent.copyrightHeaders = [
            {
                "path": "extras/copyright headers/TsFiles-Header.txt",
                "appliesTo": "src",
                "includes": ["ts"],
                "excludes": []
            }
        ];
        
        utils.saveToSetupFile(setup);
    
        // Create the copyright header template
        expect(utils.fm.createDirectory('./extras/copyright headers')).toBe(true);
        expect(utils.fm.saveFile('./extras/copyright headers/TsFiles-Header.txt', "/* this header is correct */\n")).toBe(true);
        
        // Add the correct header to all existing ts files on the generated project structure
        let tsFiles = utils.fm.findDirectoryItems('./', /.*\.ts$/i, 'absolute');
     
        for(let tsFile of tsFiles){
            
            expect(utils.fm.saveFile(tsFile, "/* this header is correct */\n\n\nand some more text")).toBe(true);
        }
        
        expect(utils.exec('-l')).toContain("validate ok");
        
        // Create a file that ends with ts but is not a .ts file. This must currently fail cause we have included all files which end with ts
        expect(utils.fm.saveFile('./src/main/ts/ThisIsNotAts', "invalid header")).toBe(true);
        
        let buildResult = utils.exec('-l');
        expect(buildResult).toContain("Bad copyright header");
        expect(buildResult).toContain("ThisIsNotAts");
        expect(buildResult).toContain("Must be as defined in extras/copyright headers/TsFiles-Header.txt");
        
        // We now alter the includes pattern to be .ts instead of ts
        setup.validate.filesContent.copyrightHeaders = [
            {
                "path": "extras/copyright headers/TsFiles-Header.txt",
                "appliesTo": "src",
                "includes": [".ts"],
                "excludes": []
            }
        ];
        
        utils.saveToSetupFile(setup);
        
        // The ThisIsNotAts file is now ignored
        expect(utils.exec('-l')).toContain("validate ok");
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
    
    
    it('should fail on a site_php project with a turbosite file that has invalid uri values on the api section', function() {
        
        let turboSiteSetupPath = '.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup;
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");     
        
        expect(utils.exec('-l')).toContain("validate ok");
        
        let turboSiteSetup = JSON.parse(utils.fm.readFile(turboSiteSetupPath));   
        
        turboSiteSetup.api[0].uri = 'aapi/site';
        expect(utils.fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        expect(utils.exec('-l')).toContain('All URIs defined inside the api section on turbosite.json must start with api/ (found: aapi/site)');
        
        turboSiteSetup.api[0].uri = 'api/site';
        expect(utils.fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
        
        turboSiteSetup.api.push({uri: 'api1/site', namespace: turboSiteSetup.api[0].namespace});
        expect(utils.fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        expect(utils.exec('-l')).toContain('All URIs defined inside the api section on turbosite.json must start with api/ (found: api1/site)');
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
    
    
    it('should fail validate if replaceVersion.enabled is missing on turbosite setup.build for a lib_js project type', function() {
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        delete setup.build.replaceVersion.enabled;
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("instance.build.replaceVersion requires property \"enabled\"");
    });
    
    
    it('should validate ok setup with empty sync property', function() {
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();         
        delete setup.sync;       
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok setup with correct sync filesystem task', function() {
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();         
        setup.sync = {
            "runAfterBuild": false,
            "type": "fileSystem",
            "excludes": ["some-filename-string"],
            "sourcePath": "dist/",
            "destPath": "X:\\somepath-to-copy-files-to",
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents": true
        };
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok setup with correct sync ftp task', function() {
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();         
        setup.sync = {
            "runAfterBuild": false,
            "type": "ftp",
            "excludes": ["some-filename-string"],
            "sourcePath": "dist/",
            "remotePath": "/public_html/somepath",
            "remoteUrl" : "http://localhost",
            "host": "www.someserver.com",
            "user": "serverUser",
            "psw": "serverpsw"
        };
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("validate ok");
    });
    

    it('should fail validate setup with a wrong sync ftp task', function() {
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();         
        setup.sync = {
            "runAfterBuild": false,
            "type": "ftp",
            "excludes": ["some-filename-string"],
            "someinvalid": "invalidvalue",
            "sourcePath": "dist/",
            "remotePath": "/public_html/somepath",
            "remoteUrl" : "http://localhost",
            "host": "www.someserver.com",
            "user": "serverUser",
            "psw": "serverpsw"
        };
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("Invalid JSON schema");
        
        delete setup.sync.someinvalid;
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("validate ok");
        
        setup.sync.nonexistant = 'somevalue';
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("Invalid JSON schema");
    });
    
    
    it('should fail validate setup with a wrong sync filesystem task', function() {
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();         
        setup.sync = {
            "runAfterBuild": false,
            "type": "invalidtype",
            "excludes": ["some-filename-string"],
            "sourcePath": "dist/",
            "destPath": "X:\\somepath-to-copy-files-to",
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents": true
        };
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("Invalid JSON schema");
        
        setup.sync.type = 'fileSystem';
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("validate ok");
        
        setup.sync.destPath = 1;
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain("Invalid JSON schema");
    });
    
    
    it('should fail when a corrupted turbobuilder.json file exists', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.fm.saveFile('.' + utils.fm.dirSep() + global.fileNames.setup, '{ "a": 1, { ')).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('Corrupted JSON for');
    });
    
    
    it('should fail when a corrupted turbosite.json file exists', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.fm.saveFile('.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup, '{ "a": 1, { }')).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('Corrupted JSON for');
    });

    
    it('should fail when turbobuilder.json does not contain a $schema property', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        delete setup.$schema;
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbobuilder.json');
        expect(lintResult).toContain('instance requires property "$schema"');  
    });
    
    
    it('should fail when turbosite.json does not contain a $schema property', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let tsSetup = JSON.parse(utils.fm.readFile('.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup));
        
        delete tsSetup.$schema;
        
        expect(utils.fm.saveFile('.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup))).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbosite.json');
        expect(lintResult).toContain('instance requires property "$schema"');
    });
    

    it('should fail when turbobuilder.json $schema property contains invalid values', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile(); 
        
        setup.$schema = 'some invalid value';
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbobuilder.json');
        expect(lintResult).toContain('instance.$schema is not one of enum values'); 
    });
    
    
    it('should fail when turbosite.json $schema property contains invalid values', function() {
    
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let tsSetup = JSON.parse(utils.fm.readFile('.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup));
        
        tsSetup.$schema = 'some invalid value';
        
        expect(utils.fm.saveFile('.' + utils.fm.dirSep() + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup))).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbosite.json');
        expect(lintResult).toContain('instance.$schema is not one of enum values');
    });
    
    
    it('should validate ok when turbobuilder.json and package.json contain same project name and description on a site_php project', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();        
        setup.metadata.name = 'name';        
        setup.metadata.description = 'description';        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        let packageJson = JSON.parse(utils.fm.readFile('.' + utils.fm.dirSep() + 'package.json'));        
        packageJson.name = 'name';        
        packageJson.description = 'description';         
        expect(utils.fm.saveFile('.' + utils.fm.dirSep() + 'package.json', JSON.stringify(packageJson))).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('validate ok');
    });
    
    
    it('should fail when turbobuilder.json and package.json contain different project names on a site_php project', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();        
        setup.metadata.name = 'name 1';        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        let packageJson = JSON.parse(utils.fm.readFile('.' + utils.fm.dirSep() + 'package.json'));        
        packageJson.name = 'name 2';        
        expect(utils.fm.saveFile('.' + utils.fm.dirSep() + 'package.json', JSON.stringify(packageJson))).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('Name and description must match between the following files');
        expect(lintResult).toContain('package.json');
        expect(lintResult).toContain('turbobuilder.json');
    });
    
    
    it('should fail when turbobuilder.json and package.json contain different project descriptions on a site_php project', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();        
        setup.metadata.description = 'desc 1';        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        let packageJson = JSON.parse(utils.fm.readFile('.' + utils.fm.dirSep() + 'package.json'));        
        packageJson.description = 'desc 2';        
        expect(utils.fm.saveFile('.' + utils.fm.dirSep() + 'package.json', JSON.stringify(packageJson))).toBe(true);
        
        let lintResult = utils.exec('-l');
        expect(lintResult).toContain('Name and description must match between the following files');
        expect(lintResult).toContain('package.json');
        expect(lintResult).toContain('turbobuilder.json');
    });
    
    
    it('should validate with default values even if projectStructure is missing on turbobuilder.json', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();        
        
        expect(setup.validate.projectStructure.readmeFileMandatory).toBe(true);
        
        delete setup.validate.projectStructure;
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
        
        expect(utils.fm.deleteFile('.' + utils.fm.dirSep() + global.fileNames.readme)).toBe(true);        
        expect(utils.exec('-l')).toContain('README.md does not exist');
        
        expect(utils.fm.deleteDirectory('.' + utils.fm.dirSep() + global.folderNames.extras)).toBe(true);        
        expect(utils.exec('-l')).toContain('extras does not exist');
    });
    
    
    it('should fail validation when projectStructure.readmeFileMandatory is enabled and README.md does not exist', function() {

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();        
        
        expect(setup.validate.projectStructure.readmeFileMandatory).toBe(true);
        
        expect(utils.fm.deleteFile('.' + utils.fm.dirSep() + global.fileNames.readme)).toBe(true);        
        
        expect(utils.exec('-l')).toContain('README.md does not exist');
        
        setup.validate.projectStructure.readmeFileMandatory = false;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
        
        delete setup.validate.projectStructure.readmeFileMandatory;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('README.md does not exist');
    });
    
    
    it('should fail validation when projectStructure.extrasFolderMandatory is enabled and extras folder does not exist', function() {

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();        
        
        expect(setup.validate.projectStructure.extrasFolderMandatory).toBe(true);
        
        expect(utils.fm.deleteDirectory('.' + utils.fm.dirSep() + global.folderNames.extras)).toBe(true);        
        
        expect(utils.exec('-l')).toContain('extras does not exist');
        
        setup.validate.projectStructure.extrasSubFoldersMandatory = [];        
        setup.validate.projectStructure.extrasFolderMandatory = false;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
        
        delete setup.validate.projectStructure.extrasFolderMandatory;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('extras does not exist');
    });
    
    
    it('should fail validation when projectStructure.extrasSubFoldersMandatory is enabled and extras subfolders do not match', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();        
        
        expect(utils.fm.createDirectory('.' + utils.fm.dirSep() + global.folderNames.extras + utils.fm.dirSep() + 'somedir')).toBe(true);        
        expect(utils.exec('-l')).toContain('validate ok');
        
        expect(utils.fm.deleteDirectory('.' + utils.fm.dirSep() + global.folderNames.extras + utils.fm.dirSep() + 'help')).toBe(true);        
        expect(utils.exec('-l')).toContain('help does not exist');
        
        setup.validate.projectStructure.extrasSubFoldersMandatory = [];        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
        
        delete setup.validate.projectStructure.extrasSubFoldersMandatory;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('help does not exist');
    });
    
    
    it('should fail validation when projectStructure.extrasTodoExtension is enabled and extras/todo files do not have .todo extension', function() {

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();        
        
        expect(setup.validate.projectStructure.extrasTodoExtension).toBe(true);
        
        expect(utils.fm.saveFile('.' + utils.fm.dirSep() + global.folderNames.extras + utils.fm.dirSep() +
                'todo' + utils.fm.dirSep() + 'test.txt', 'txt')).toBe(true);        
        
        expect(utils.exec('-l')).toContain('test.txt must have .todo extension');
        
        setup.validate.projectStructure.extrasTodoExtension = false;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
                
        delete setup.validate.projectStructure.extrasTodoExtension;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('test.txt must have .todo extension');
    });
    
    
    it('should correctly validate when css files exist / not exist and onlyScss validation rule is true / false', function() {

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.exec('-l')).toContain('validate ok');
       
        let setup = utils.readSetupFile();        
        
        // Check that the only css rule is enabled
        expect(setup.validate.styleSheets.onlyScss).toBe(true);
        
        expect(utils.fm.saveFile('./src/main/view/css/test.css', "")).toBe(true);

        expect(utils.exec('-l')).toContain('only scss files are allowed');
        
        // Disable the only css rule
        setup.validate.styleSheets.onlyScss = false;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-l')).toContain('validate ok');
        
        expect(utils.fm.deleteFile('./src/main/view/css/test.css')).toBe(true);
        
        expect(utils.exec('-l')).toContain('validate ok');
    });
    
    
    it('should correctly validate when tabulations exist / not exist and tabsForbidden validation rule is true / false', function() {

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.exec('-l')).toContain('validate ok');
       
        let setup = utils.readSetupFile();
        
        // Disable the namespaces validation
        setup.validate.php.namespaces.enabled = false;
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        // Check that the tabsForbidden rule is enabled
        expect(setup.validate.filesContent.tabsForbidden.enabled).toBe(true);
        expect(setup.validate.filesContent.tabsForbidden.appliesTo).toEqual(["src", "extras"]);
        expect(setup.validate.filesContent.tabsForbidden.excludes).toEqual([".svg", ".properties"]);
        
        // Create files with tabs and make sure validation fails
        expect(utils.fm.saveFile('./src/main/test.php', "contains\ttabs")).toBe(true);
        expect(utils.fm.saveFile('./extras/help/test.md', "contains\ttabs")).toBe(true);
        
        let validateResult = utils.exec('-l');
        expect(validateResult).toContain('File contains tabulations');
        expect(validateResult).toContain('test.php');
        expect(validateResult).toContain('test.md');
        
        setup.validate.filesContent.tabsForbidden.appliesTo = ["src"];        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        validateResult = utils.exec('-l');
        expect(validateResult).toContain('File contains tabulations');
        expect(validateResult).toContain('test.php');
        expect(validateResult).not.toContain('test.md');
        
        // Disable validation and make sure it now validates ok
        setup.validate.filesContent.tabsForbidden.enabled = false;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
        
        setup.validate.filesContent.tabsForbidden.appliesTo = [];        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
        
        setup.validate.filesContent.tabsForbidden.excludes = [];        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('validate ok');
        
        // Delete the validation rule and make sure it now fails
        delete setup.validate.filesContent.tabsForbidden.enabled;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('filesContent.tabsForbidden requires property "enabled"');
        
        delete setup.validate.filesContent.tabsForbidden;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('File contains tabulations');
        
        delete setup.validate.filesContent;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        expect(utils.exec('-l')).toContain('File contains tabulations');
    });
    
    
    it('should validate ok a newly generated server_php project', function() {

        expect(utils.exec('-g server_php')).toContain("Generated project structure ok");
        
        let buildResult = utils.exec('-l');
        expect(buildResult).toContain("validate start");
        expect(buildResult).toContain("validate ok");
    });
    
    
    // TODO - more validation tests related to server_php
    
});
