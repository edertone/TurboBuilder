'use strict';


/**
 * Tests related to the validate feature of the cmd app
 */


require('./../../../main/js/globals');
const setupModule = require('./../../../main/js/setup');
const { StringUtils } = require('turbocommons-ts');
const { StringTestsManager, TurboSiteTestsManager } = require('turbotesting-node');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');


const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');
const terminalManager = new TerminalManager();
const stringTestsManager = new StringTestsManager();


describe('cmd-parameter-validate', function() {
    
    
    beforeAll(function() {
        
        // Aux function to validate the copypaste detector setup
        this.testCopyPasteDetectSetupIsValid = (setup) => {
        
            expect(setup.validate.filesContent.copyPasteDetect.length).toBe(2);
            expect(setup.validate.filesContent.copyPasteDetect[0].report).toBe('');
            expect(setup.validate.filesContent.copyPasteDetect[0].maxPercentErrorLevel).toBe(0);
            expect(setup.validate.filesContent.copyPasteDetect[1].report).toBe('');
            expect(setup.validate.filesContent.copyPasteDetect[1].maxPercentErrorLevel).toBe(0);
        };
    });
    
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-validate');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });

    
    it('should validate ok a newly generated lib_php project', function() {

        testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok a newly generated lib_js project', function() {

        testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
    
    it('should fail on a lib_js project with a turbobuilder file with unexpected field', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        // Test that no validate.php section exists
        expect(setup.validate.hasOwnProperty('php')).toBe(false); 
        
        setup.build.lib_js.invalidField = 'invalid';
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/instance.build.lib_js is not allowed to have the additional property "invalidField"[\s\S]{0,5}$/);
    });
    
    
    it('should fail validation when an unknown test type is defined on test section at turboduilder.json setup file', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
        
        // Disable use strict validation on setup and test that it now validates
        expect(setup.test.enabledTests[0].type).toBe("jasmine");
        
        setup.test.enabledTests[0].nonexistantProperty = 'somevalue';
        
        testsGlobalHelper.saveToSetupFile(setup);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("Invalid JSON schema for turbobuilder.json");
        
        setup.test.enabledTests = [{
                "type": "nonexistant",
                "jasmineConfig": "src/test/js/jasmine.json"
            }];
        
        testsGlobalHelper.saveToSetupFile(setup);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("Invalid JSON schema for turbobuilder.json");
    });
    
    
    it('should fail validate for javascript files that do not contain the use strict modifier', function() {
    
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
        
        expect(fm.saveFile('./src/main/test.js', "does not begin with use strict")).toBe(true);
         
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('File must start with "use strict":');
        
        // Disable use strict validation on setup and test that it now validates
        setup.validate.javascript.useStrict = {
                "enabled": false,
                "includes": [".js"],
                "excludes": ["src/main/libs"]
            };
        
        testsGlobalHelper.saveToSetupFile(setup);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/validate ok[\s\S]{0,5}$/);
        
        // Enable again the use strict validation on setup but ignore the bad file
        setup.validate.javascript.useStrict = {
                "enabled": true,
                "includes": [".js"],
                "excludes": ["test.js"]
            };
        
        testsGlobalHelper.saveToSetupFile(setup);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/validate ok[\s\S]{0,5}$/);
    });

    
    it('should validate ok a newly generated lib_ts project', function() {

        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok a newly generated site_php project', function() {

        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let buildResult = testsGlobalHelper.execTbCmd('-l');
        expect(buildResult).toContain("validate start");
        expect(buildResult).toContain("validate ok");
    });
    
    
    it('should not show the empty logs source property warning on a newly generated site_php project when the value is specifically set on the turbodepot.json file', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let buildResult = testsGlobalHelper.execTbCmd('-l');
        expect(buildResult).toContain("No logs will be written for this project");
        expect(buildResult).toContain("validate ok");
        
        let turboDepotSetup = tsm.getSetup('turbodepot');
        
        turboDepotSetup.depots[0].logs.source = 'some source';
        expect(testsGlobalHelper.saveToSetupFile(turboDepotSetup, 'turbodepot.json')).toBe(true);
     
        buildResult = testsGlobalHelper.execTbCmd('-l');
        expect(buildResult).not.toContain("No logs will be written for this project");
        expect(buildResult).toContain("validate ok");
    });
    
    
    it('should fail validaton on a newly generated site_php project with an empty turbobuilder setup', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(testsGlobalHelper.saveToSetupFile({})).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("No valid project type specified. Please enable any of");
    });
    
    
    it('should fail validaton on a newly generated site_php project with a turbobuilder setup containing only $schema and metadata', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(testsGlobalHelper.saveToSetupFile({"$schema": setup.$schema, metadata: {builderVersion: setupModule.getBuilderVersion()}}))
            .toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("No valid project type specified. Please enable any of");    
    });

    
    it('should validate ok a newly generated site_php project with a turbobuilder setup containing only $schema, metadata and build', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(testsGlobalHelper.saveToSetupFile({"$schema": setup.$schema, 
            metadata: {
                name: '',
                description: '',
                builderVersion: setupModule.getBuilderVersion()
            },
            build: {site_php: {}},
            validate: {filesContent: {copyPasteDetect: []}}}))
                .toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");  
    });
    
    
    it('should fail validation for a newly generated site_php project with an invalid homeView value on turbosite.json', function() {
          
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tsSetup = JSON.parse(fm.readFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup));
        
        tsSetup.homeView = 'invalidviewvalue';
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup))).toBe(true);
        
        let execResult = testsGlobalHelper.execTbCmd('-l');
        
        expect(execResult).toContain("Home view defined at turbosite.json does not exist");  
        expect(execResult).toMatch(/invalidviewvalue.invalidviewvalue.php/);  
    });
    
    
    it('should fail validation for a newly generated server_php project with an invalid homeView value on turbosite.json', function() {
          
        testsGlobalHelper.generateProjectAndSetup('server_php', null, []);
        
        let tsSetup = JSON.parse(fm.readFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup));
        
        tsSetup.homeView = 'invalidviewvalue';
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup))).toBe(true);
        
        let execResult = testsGlobalHelper.execTbCmd('-l');
        
        expect(execResult).toContain("Home view defined at turbosite.json does not exist");  
        expect(execResult).toMatch(/invalidviewvalue.invalidviewvalue.php/);  
    });
    
    
    it('should fail validation for a newly generated site_php project with an invalid singleParameterView value on turbosite.json', function() {
          
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tsSetup = JSON.parse(fm.readFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup));
        
        tsSetup.singleParameterView = 'invalidviewvalue';
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup))).toBe(true);
        
        let execResult = testsGlobalHelper.execTbCmd('-l');
        
        expect(execResult).toContain("Single parameter view defined at turbosite.json does not exist");  
        expect(execResult).toMatch(/invalidviewvalue.invalidviewvalue.php/);  
    });
    
    
    it('should fail validation for a newly generated server_php project with an invalid singleParameterView value on turbosite.json', function() {
          
        testsGlobalHelper.generateProjectAndSetup('server_php', null, []);
        
        let tsSetup = JSON.parse(fm.readFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup));
        
        tsSetup.singleParameterView = 'invalidviewvalue';
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup))).toBe(true);
        
        let execResult = testsGlobalHelper.execTbCmd('-l');
        
        expect(execResult).toContain("Single parameter view defined at turbosite.json does not exist");  
        expect(execResult).toMatch(/invalidviewvalue.invalidviewvalue.php/);  
    });
    
    
    it('should validate by default before build on a generated lib_php project', function() {
        
        testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-b'), ["validate ok", "build ok"]);
    });

    
    it('should validate by default before build on a generated lib_ts project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        expect(testsGlobalHelper.saveToSetupFile({"$schema": setup.$schema, metadata: {builderVersion: setupModule.getBuilderVersion()}, build: {lib_ts: {}}}))
            .toBe(true);
        
        expect(fm.saveFile('./src/main/ts/index.ts', '')).toBe(true);

        let buildResult = testsGlobalHelper.execTbCmd('-b');
        
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("Webpack ES5 ok");
        expect(buildResult).toContain("build ok");
    });
    
    
    it('should validate by default before build on a generated site_php project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(testsGlobalHelper.saveToSetupFile({"$schema": setup.$schema, 
            metadata: {
                name: '',
                description: '',
                builderVersion: setupModule.getBuilderVersion()
            },
            build: {site_php: {}},
            validate: {filesContent: {copyPasteDetect: []}}}))
                .toBe(true);
        
        let buildResult = testsGlobalHelper.execTbCmd('-b');
        
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("build ok");
    });
    
    
    it('should not validate two times if runBeforeBuild is enabled on a generated site_php project and -bl options are passed', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', {site_php: {}}, []);
        
        expect(setup.validate.runBeforeBuild).toBe(true);
        
        let buildResult = testsGlobalHelper.execTbCmd('-bl');
        
        expect(buildResult).not.toContain("validate start");
        expect(buildResult).toContain("validate ok");
        expect(buildResult).toContain("build ok");
        
        let buildResult2 = testsGlobalHelper.execTbCmd('-lb');
        
        expect(buildResult2).not.toContain("validate start");
        expect(buildResult2).toContain("validate ok");
        expect(buildResult2).toContain("build ok");
    });
    
    
    it('should fail if only a setup file exists on the folder', function() {
        
        expect(testsGlobalHelper.saveToSetupFile({"$schema": "", metadata: {builderVersion: setupModule.getBuilderVersion()}, 
            build: {lib_ts: {}},
            validate: {runBeforeBuild: false}}))
                .toBe(true);

        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/no files to build[\s\S]{0,5}$/);
    });
    
    
    it('should not validate before build when disabled in setup', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        expect(testsGlobalHelper.saveToSetupFile({"$schema": setup.$schema, metadata: {builderVersion: setupModule.getBuilderVersion()}, 
            build: {lib_ts: {}},
            validate: {runBeforeBuild: false}}))
                .toBe(true);

        let buildResult = testsGlobalHelper.execTbCmd('-b');
        
        expect(buildResult).toContain("build ok");
        expect(buildResult).not.toContain("validate ok");
    });
    
    
    it('should fail validation if copyright headers file template is not found', function() {
    
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        setup.validate.filesContent.copyrightHeaders = [
                        {
                            "path": "extras/copyright headers/nonexistantfile.txt",
                            "affectedPaths": ["src"],
                            "includes": ["ts"],
                            "excludes": ["file3"]
                        }
                    ];
        
        testsGlobalHelper.saveToSetupFile(setup);
        
        let execResult = testsGlobalHelper.execTbCmd('-l');
        
        expect(execResult).toContain("Copyrhight headers template not found");
        expect(execResult).toContain("nonexistantfile.txt");
    });
    
    
    it('should validate copyright headers when enabled in setup and all project files have valid headers except an excluded one', function() {
    
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        setup.validate.runBeforeBuild = false;
        
        setup.validate.filesContent.copyrightHeaders = [
                            {
                                "path": "extras/copyright headers/TsFiles-Header.txt",
                                "affectedPaths": ["src"],
                                "includes": [".ts"],
                                "excludes": ["file3"]
                            }
                        ];
                
        testsGlobalHelper.saveToSetupFile(setup);
        
        // Create the copyright header template
        expect(fm.createDirectory('./extras/copyright headers')).toBe(true);
        expect(fm.saveFile('./extras/copyright headers/TsFiles-Header.txt', "/* this header is correct */\n")).toBe(true);
        
        // Add the correct header to all existing ts files on the generated project structure
        let tsFiles = fm.findDirectoryItems('./', /.*\.ts$/i, 'absolute');
     
        for(let tsFile of tsFiles){
            
            expect(fm.saveFile(tsFile, "/* this header is correct */\n\n\nand some more text")).toBe(true);
        }
 
        // Add some files with the right header
        expect(fm.saveFile('./src/main/ts/index.ts', "/* this header is correct */\n\n\nand some more text")).toBe(true);
        expect(fm.saveFile('./src/main/ts/file1.ts', "/* this header is correct */\n\n\nmore text here")).toBe(true);
        expect(fm.saveFile('./src/main/ts/file2.ts', "/* this header is correct */\n\n\neven more text")).toBe(true);
        expect(fm.saveFile('./src/main/ts/file3.ts', "/* this header is not correct */\n\n\neven more text")).toBe(true);
   
        // Test that headers are correctly validated
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
        
        // Test that headers are not correctly validated when file 3 is not excluded
        setup.validate.filesContent.copyrightHeaders[0].excludes = [];
        
        testsGlobalHelper.saveToSetupFile(setup);
        
        let buildResult = testsGlobalHelper.execTbCmd('-l');
            
        expect(buildResult).toContain("Bad copyright header:");
        expect(buildResult).toContain("file3.ts");
        expect(buildResult).toContain("Must be as defined in extras/copyright headers/TsFiles-Header.txt");
        expect(buildResult).not.toContain("validate ok");
        
        // Add a file with bad header
        expect(fm.createDirectory('./src/main/ts/somefolder')).toBe(true);
        expect(fm.saveFile('./src/main/ts/somefolder/file4.ts', "/* this heade1r is correct */\n\n\neven more text")).toBe(true);
      
        // Test that headers are correctly validated
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("file4.ts");
    });
    
    
    it('should corectly detect files that match the includes list on copyrightHeaders setup', function() {
    
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        setup.validate.filesContent.copyrightHeaders = [
            {
                "path": "extras/copyright headers/TsFiles-Header.txt",
                "affectedPaths": ["src"],
                "includes": ["ts"],
                "excludes": [".txt"]
            }
        ];
        
        testsGlobalHelper.saveToSetupFile(setup);
    
        // Create the copyright header template
        expect(fm.createDirectory('./extras/copyright headers')).toBe(true);
        expect(fm.saveFile('./extras/copyright headers/TsFiles-Header.txt', "/* this header is correct */\n")).toBe(true);
        
        // Add the correct header to all existing ts files on the generated project structure
        let tsFiles = fm.findDirectoryItems('./', /.*\.ts$/i, 'absolute');
     
        for(let tsFile of tsFiles){
            
            expect(fm.saveFile(tsFile, "/* this header is correct */\n\n\nand some more text")).toBe(true);
        }
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
        
        // Create a file that ends with ts but is not a .ts file. This must currently fail cause we have included all files which end with ts
        expect(fm.saveFile('./src/main/ts/ThisIsNotAts', "invalid header")).toBe(true);
        
        let buildResult = testsGlobalHelper.execTbCmd('-l');
        expect(buildResult).toContain("Bad copyright header");
        expect(buildResult).toContain("ThisIsNotAts");
        expect(buildResult).toContain("Must be as defined in extras/copyright headers/TsFiles-Header.txt");
        
        // We now alter the includes pattern to be .ts instead of ts
        setup.validate.filesContent.copyrightHeaders = [
            {
                "path": "extras/copyright headers/TsFiles-Header.txt",
                "affectedPaths": ["src"],
                "includes": [".ts"],
                "excludes": []
            }
        ];
        
        testsGlobalHelper.saveToSetupFile(setup);
        
        // The ThisIsNotAts file is now ignored
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
   
    it('should fail on a site_php project with a missing turbobuilder setup file', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(fm.deleteFile('.' + fm.dirSep() + global.fileNames.setup)).toBe(true);        
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain(global.fileNames.setup + ' setup file not found');
    });
    
    
    it('should fail on a site_php project with a turbobuilder file with unexpected field', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.unexpected = 'unexpected';
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('instance is not allowed to have the additional property "unexpected"');
    });

    
    it('should fail on a site_php project with a missing turbosite setup file', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(fm.deleteFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup)).toBe(true);        
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("Could not find " + global.fileNames.turboSiteSetup + " at ");
    });

    
    it('should fail on a site_php project with a turbosite file with missing homeView field', function() {
            
        let turboSiteSetupPath = '.' + fm.dirSep() + global.fileNames.turboSiteSetup;
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let turboSiteSetup = JSON.parse(fm.readFile(turboSiteSetupPath));       
        expect(turboSiteSetup.homeView).toBe('home');        
        delete turboSiteSetup.homeView;
        
        expect(fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('instance requires property "homeView"');
    });
    
    
    it('should fail on a site_php project with a turbosite file with missing locales field', function() {
        
        let turboSiteSetupPath = '.' + fm.dirSep() + global.fileNames.turboSiteSetup;
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        let turboSiteSetup = JSON.parse(fm.readFile(turboSiteSetupPath));   
        delete turboSiteSetup.locales;
        
        expect(fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('instance requires property "locales"');
    });
    
    
    it('should fail on a site_php project with a turbosite file with missing globalJs field', function() {
        
        let turboSiteSetupPath = '.' + fm.dirSep() + global.fileNames.turboSiteSetup;
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let turboSiteSetup = JSON.parse(fm.readFile(turboSiteSetupPath));   
        delete turboSiteSetup.globalJs;
        
        expect(fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('instance requires property "globalJs"');
    });
    
    
    it('should fail on a site_php project with a turbosite file that has invalid uri values on the api section', function() {
        
        let turboSiteSetupPath = '.' + fm.dirSep() + global.fileNames.turboSiteSetup;
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
        
        let turboSiteSetup = JSON.parse(fm.readFile(turboSiteSetupPath));   
        
        turboSiteSetup.webServices.api[0].uri = 'aapi/site';
        expect(fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('All URIs defined inside the api section on turbosite.json must start with api/ (found: aapi/site)');
        
        turboSiteSetup.webServices.api[0].uri = 'api/site';
        expect(fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        turboSiteSetup.webServices.api.push({uri: 'api1/site', namespace: turboSiteSetup.webServices.api[0].namespace});
        expect(fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('All URIs defined inside the api section on turbosite.json must start with api/ (found: api1/site)');
    });


    it('should fail on a site_php project with a turbosite file with unexpected field', function() {
        
        let turboSiteSetupPath = '.' + fm.dirSep() + global.fileNames.turboSiteSetup;
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        let turboSiteSetup = JSON.parse(fm.readFile(turboSiteSetupPath));
        turboSiteSetup.unexpectedValue = 'some value';
        
        expect(fm.saveFile(turboSiteSetupPath, JSON.stringify(turboSiteSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('instance is not allowed to have the additional property "unexpectedValue"');
    });
    
    
    it('should validate ok if wildcards section is empty for a lib_js project type', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        setup.wildCards = {};
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
    
    it('should fail validate if wildCards.versionWildCard is not correctly formatted on turbobuilder for a lib_js project type', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        setup.wildCards = {
            "versionWildCard":{             
                "wildCard": "--build-version--",
                "code":{
                    "includes": [".js"],
                    "excludes": []
                },
                "files": {
                    "includes": [],
                    "excludes": []    
                }
            }
        };
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/Invalid JSON schema for turbobuilder.json[\s\S]*wildCards.versionWildCard requires property "enabled"/);
        
        setup.wildCards = {
            "versionWildCard":{
                "enabled": true,       
                "wildCard": "--build-version--",
                "files": {
                    "includes": [],
                    "excludes": []    
                }
            }
        };
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/Invalid JSON schema for turbobuilder.json[\s\S]*wildCards.versionWildCard requires property "code"/);
    });
    
    
    it('should validate ok setup with empty sync property', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        delete setup.sync;       
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok setup with correct sync filesystem task', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        setup.sync = {
            "runAfterBuild": false,
            "type": "fileSystem",
            "excludes": ["some-filename-string"],
            "sourcePath": "dist/",
            "destPath": "X:\\somepath-to-copy-files-to",
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents": true
        };
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok setup with correct sync ftp task', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
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
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    

    it('should fail validate setup with a wrong sync ftp task', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
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
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("Invalid JSON schema");
        
        delete setup.sync.someinvalid;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
        
        setup.sync.nonexistant = 'somevalue';
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("Invalid JSON schema");
    });
    
    
    it('should fail validate setup with a wrong sync filesystem task', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        setup.sync = {
            "runAfterBuild": false,
            "type": "invalidtype",
            "excludes": ["some-filename-string"],
            "sourcePath": "dist/",
            "destPath": "X:\\somepath-to-copy-files-to",
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents": true
        };
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("Invalid JSON schema");
        
        setup.sync.type = 'fileSystem';
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
        
        setup.sync.destPath = 1;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("Invalid JSON schema");
    });
    
    
    it('should fail when a corrupted turbobuilder.json file exists', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.setup, '{ "a": 1, { ')).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Corrupted JSON for');
    });
    
    
    it('should fail when a corrupted turbosite.json file exists', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup, '{ "a": 1, { }')).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Corrupted JSON for');
    });
    
    
    it('should fail when a turbobuilder.json file jas duplicate keys', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let turbobuilderAsString = fm.readFile('.' + fm.dirSep() + global.fileNames.setup);
        
        turbobuilderAsString = StringUtils.replace(turbobuilderAsString, '"strictFileExtensionCase"',
            '"readmeFileMandatory": true,"strictFileExtensionCase"', 1);
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.setup, turbobuilderAsString)).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Duplicate keys found on JSON for turbobuilder.json');
        expect(lintResult).toContain('duplicated keys "readmeFileMandatory"');
    });
    
    
    it('should fail when a turbosite.json file jas duplicate keys', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let turbobuilderAsString = fm.readFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup);
        
        turbobuilderAsString = StringUtils.replace(turbobuilderAsString, '"globalHtml"',
            '"homeView": "home","globalHtml"', 1);
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup, turbobuilderAsString)).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Duplicate keys found on JSON for turbosite.json');
        expect(lintResult).toContain('duplicated keys "homeView"');
    });
    
    
    it('should fail validation when a turbobuilder.release.json file has invalid properties', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let turbobuilderReleaseSetup = {invalidProp: ''};
        
        expect(testsGlobalHelper.saveToSetupFile(turbobuilderReleaseSetup, 'turbobuilder.release.json')).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbobuilder.release.json');
        expect(lintResult).toContain('instance is not allowed to have the additional property "invalidProp"');
    });
    
    
    it('should fail validation when a turbodepot.release.json file has invalid properties', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let turbodepotReleaseSetup = {invalidProp: ''};
        
        expect(testsGlobalHelper.saveToSetupFile(turbodepotReleaseSetup, 'turbodepot.release.json')).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbodepot.release.json');
        expect(lintResult).toContain('instance is not allowed to have the additional property "invalidProp"');
    });
    
    
    it('should fail validation when a turbosite.release.json file has invalid properties', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let turbositeReleaseSetup = JSON.parse(fm.readFile('./turbosite.release.json'));
        
        turbositeReleaseSetup.invalidProp = '';
        
        expect(testsGlobalHelper.saveToSetupFile(turbositeReleaseSetup, 'turbosite.release.json')).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbosite.release.json');
        expect(lintResult).toContain('instance is not allowed to have the additional property "invalidProp"');
    });

    
    it('should fail when turbobuilder.json does not contain a $schema property', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        delete setup.$schema;
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbobuilder.json');
        expect(lintResult).toContain('instance requires property "$schema"');  
    });
    
    
    it('should fail when turbosite.json does not contain a $schema property', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tsSetup = JSON.parse(fm.readFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup));
        
        delete tsSetup.$schema;
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup))).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbosite.json');
        expect(lintResult).toContain('instance requires property "$schema"');
    });
    

    it('should fail when turbobuilder.json $schema property contains invalid values', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.$schema = 'some invalid value';
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbobuilder.json');
        expect(lintResult).toContain('instance.$schema is not one of enum values'); 
    });
    
    
    it('should fail when turbosite.json $schema property contains invalid values', function() {
    
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tsSetup = JSON.parse(fm.readFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup));
        
        tsSetup.$schema = 'some invalid value';
        
        expect(fm.saveFile('.' + fm.dirSep() + global.fileNames.turboSiteSetup, JSON.stringify(tsSetup))).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Invalid JSON schema for turbosite.json');
        expect(lintResult).toContain('instance.$schema is not one of enum values');
    });
    
    
    it('should validate ok when turbobuilder.json and package.json contain same project name and description on a site_php project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.metadata.name = 'name';        
        setup.metadata.description = 'description';        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let packageJson = JSON.parse(fm.readFile('.' + fm.dirSep() + 'package.json'));        
        packageJson.name = 'name';        
        packageJson.description = 'description';         
        expect(fm.saveFile('.' + fm.dirSep() + 'package.json', JSON.stringify(packageJson))).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('validate ok');
    });
    
    
    it('should fail when turbobuilder.json and package.json contain different project names on a site_php project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.metadata.name = 'name 1';        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let packageJson = JSON.parse(fm.readFile('.' + fm.dirSep() + 'package.json'));        
        packageJson.name = 'name 2';        
        expect(fm.saveFile('.' + fm.dirSep() + 'package.json', JSON.stringify(packageJson))).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Name and description must match between the following files');
        expect(lintResult).toContain('package.json');
        expect(lintResult).toContain('turbobuilder.json');
    });
    
    
    it('should fail when turbobuilder.json and package.json contain different project descriptions on a site_php project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.metadata.description = 'desc 1';        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let packageJson = JSON.parse(fm.readFile('.' + fm.dirSep() + 'package.json'));        
        packageJson.description = 'desc 2';        
        expect(fm.saveFile('.' + fm.dirSep() + 'package.json', JSON.stringify(packageJson))).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain('Name and description must match between the following files');
        expect(lintResult).toContain('package.json');
        expect(lintResult).toContain('turbobuilder.json');
    });
    
    
    it('should validate with default values even if projectStructure is missing on turbobuilder.json', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(setup.validate.projectStructure.readmeFileMandatory).toBe(true);
        
        delete setup.validate.projectStructure;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        expect(fm.deleteFile('.' + fm.dirSep() + global.fileNames.readme)).toBe(true);        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('README.md does not exist');
        
        expect(fm.deleteDirectory('.' + fm.dirSep() + global.folderNames.extras)).toBeGreaterThan(-1);       
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('extras does not exist');
    });
    
    
    it('should fail validation when projectStructure.readmeFileMandatory is enabled and README.md does not exist', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(setup.validate.projectStructure.readmeFileMandatory).toBe(true);
        
        expect(fm.deleteFile('.' + fm.dirSep() + global.fileNames.readme)).toBe(true);        
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('README.md does not exist');
        
        setup.validate.projectStructure.readmeFileMandatory = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        delete setup.validate.projectStructure.readmeFileMandatory;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('README.md does not exist');
    });
    
    
    it('should fail validation when projectStructure.extrasFolderMandatory is enabled and extras folder does not exist', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(setup.validate.projectStructure.extrasFolderMandatory).toBe(true);
        
        expect(fm.deleteDirectory('.' + fm.dirSep() + global.folderNames.extras)).toBeGreaterThan(-1);        
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('extras does not exist');
        
        setup.validate.projectStructure.extrasSubFoldersMandatory = [];        
        setup.validate.projectStructure.extrasFolderMandatory = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        delete setup.validate.projectStructure.extrasFolderMandatory;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('extras does not exist');
    });
    
    
    it('should fail validation when projectStructure.extrasSubFoldersMandatory is enabled and extras subfolders do not match', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(fm.createDirectory('.' + fm.dirSep() + global.folderNames.extras + fm.dirSep() + 'somedir')).toBe(true);        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        expect(fm.deleteDirectory('.' + fm.dirSep() + global.folderNames.extras + fm.dirSep() + 'help')).toBeGreaterThan(-1);        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('help does not exist');
        
        setup.validate.projectStructure.extrasSubFoldersMandatory = [];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        delete setup.validate.projectStructure.extrasSubFoldersMandatory;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('help does not exist');
    });
    
    
    it('should fail validation when projectStructure.extrasTodoExtension is enabled and extras/todo files do not have .todo extension', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(setup.validate.projectStructure.extrasTodoExtension).toBe(true);
        
        expect(fm.saveFile('.' + fm.dirSep() + global.folderNames.extras + fm.dirSep() +
                'todo' + fm.dirSep() + 'test.txt', 'txt')).toBe(true);        
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('test.txt must have .todo extension');
        
        setup.validate.projectStructure.extrasTodoExtension = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
                
        delete setup.validate.projectStructure.extrasTodoExtension;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('test.txt must have .todo extension');
    });
    
    
    it('should fail validation when projectStructure.strictSrcFolders is enabled and libs or resources folders are found outside the root of src/main and src/test', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        expect(setup.validate.projectStructure.strictSrcFolders.enabled).toBe(true);
        
        // Validate should be ok by default
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        // Add a libs folder on an incorrect place an test that validate fails
        expect(fm.createDirectory('./src/main/php/utils/libs', true)).toBe(true);  
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('Folder <libs> is only allowed inside src/main or src/test, but was found on main\\php\\utils\\libs');
        
        // Set strictfolders to false and make sure it now passes validation
        setup.validate.projectStructure.strictSrcFolders.enabled = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        // Enable again and test it fails
        setup.validate.projectStructure.strictSrcFolders.enabled = true;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('Folder <libs> is only allowed inside src/main or src/test, but was found on main\\php\\utils\\libs');
        
        // Delete the invalid libs folder and test it passes
        expect(fm.deleteDirectory('./src/main/php/utils/libs')).toBeGreaterThan(-1);  
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        // Add a resources folder on an incorrect place an test that validate fails
        expect(fm.createDirectory('./src/main/php/managers/resources', true)).toBe(true);  
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('Folder <resources> is only allowed inside src/main or src/test, but was found on main\\php\\managers\\resources');
        
        // Set strictfolders to false and make sure it now passes validation
        setup.validate.projectStructure.strictSrcFolders.enabled = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');        
        
        // Enable again and test it fails
        setup.validate.projectStructure.strictSrcFolders.enabled = true;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('Folder <resources> is only allowed inside src/main or src/test, but was found on main\\php\\managers\\resources');  
        
        // Exclude the invalid resources folder location and make sure it passes      
        setup.validate.projectStructure.strictSrcFolders.excludes = ['php\\managers'];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        // Set a raw value to the excludes list and make sure validation fails again
        setup.validate.projectStructure.strictSrcFolders.excludes = ['some-raw-value'];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('Folder <resources> is only allowed inside src/main or src/test, but was found on main\\php\\managers\\resources');  
        
        // Delete the invalid resources folder and test it passes
        expect(fm.deleteDirectory('./src/main/php/managers/resources')).toBeGreaterThan(-1);  
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');        
    });
    
    
    it('should fail validation when projectStructure.strictFileExtensionCase is enabled and a file with an extension containing upper case is found anywhere on the affected paths', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        expect(setup.validate.projectStructure.strictFileExtensionCase.affectedPaths).toEqual(['']);
        
        // Validate should be ok by default
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        // Add a file with invalid case anywhere and test that validate fails
        expect(fm.saveFile('./src/main/php/model/file.Php', 'somedata')).toBe(true);
        let validateResult = testsGlobalHelper.execTbCmd('-l');
        expect(validateResult).toContain('Expected lower case file extension');
        expect(validateResult).toContain('src\\main\\php\\model\\file.Php');
        
        // Set strictFileExtensionCase.affectedPaths to empty array and make sure it now passes validation
        setup.validate.projectStructure.strictFileExtensionCase.affectedPaths = [];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        // Enable again and test it fails
        setup.validate.projectStructure.strictFileExtensionCase.affectedPaths = ['src/main'];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        validateResult = testsGlobalHelper.execTbCmd('-l');
        expect(validateResult).toContain('Expected lower case file extension');
        expect(validateResult).toContain('src\\main\\php\\model\\file.Php');
        
        // Exclude the invalid file location and make sure it passes
        setup.validate.projectStructure.strictFileExtensionCase.excludes = ['php\\model\\'];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');

        // Set a raw value to the excludes list and make sure validation fails again
        setup.validate.projectStructure.strictFileExtensionCase.excludes = ['some-raw-value'];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        validateResult = testsGlobalHelper.execTbCmd('-l');
        expect(validateResult).toContain('Expected lower case file extension');
        expect(validateResult).toContain('src\\main\\php\\model\\file.Php');
        
        // Delete invalid file and test it passes
        expect(fm.deleteFile('./src/main/php/model/file.Php')).toBe(true);  
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');       
    });
    
    
    it('should correctly validate when css files exist / not exist and onlyScss validation rule is true / false', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
         
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
       
        // Check that the only css rule is enabled
        expect(setup.validate.styleSheets.onlyScss).toBe(true);
        
        expect(fm.saveFile('./src/main/view/css/test.css', "")).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-l')).toContain('only scss files are allowed');
        
        // Disable the only css rule
        setup.validate.styleSheets.onlyScss = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        expect(fm.deleteFile('./src/main/view/css/test.css')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
    });
    
    
    it('should fail validation when css files contain hardcoded css colors and cssHardcodedColorForbid flag is enabled', function() {
    
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(setup.validate.styleSheets.cssHardcodedColorForbid).toBe(true);
        
        expect(fm.saveFile('./src/main/view/css/test.scss', "body{ background-color: #ff0000; }")).toBe(true);
       
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/File contains hardcoded css color.*test.scss/);
    });
    
    
    it('should correctly pass validation when css files do not contain hardcoded css colors and cssHardcodedColorForbid flag is disabled', function() {
     
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.validate.styleSheets.cssHardcodedColorForbid = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(setup.validate.styleSheets.cssHardcodedColorForbid).toBe(false);
        
        expect(fm.saveFile('./src/main/view/css/test.scss', "body{ background-color: $some-color-variable; }")).toBe(true);
       
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
    });
    
    
    it('should correctly validate when tabulations exist / not exist and tabsForbidden validation rule is true / false', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
       
        // Disable the namespaces validation
        setup.validate.php.namespaces.enabled = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        // Check that the tabsForbidden rule is enabled
        expect(setup.validate.filesContent.tabsForbidden.enabled).toBe(true);
        expect(setup.validate.filesContent.tabsForbidden.affectedPaths).toEqual(["src", "extras"]);
        expect(setup.validate.filesContent.tabsForbidden.excludes).toEqual([".svg", ".properties"]);
        
        // Create files with tabs and make sure validation fails
        expect(fm.saveFile('./src/main/test.php', "contains\ttabs")).toBe(true);
        expect(fm.saveFile('./extras/help/test.md', "contains\ttabs")).toBe(true);
        
        let validateResult = testsGlobalHelper.execTbCmd('-l');
        expect(validateResult).toContain('File contains tabulations');
        expect(validateResult).toContain('test.php');
        expect(validateResult).toContain('test.md');
        
        setup.validate.filesContent.tabsForbidden.affectedPaths = ["src"];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        validateResult = testsGlobalHelper.execTbCmd('-l');
        expect(validateResult).toContain('File contains tabulations');
        expect(validateResult).toContain('test.php');
        expect(validateResult).not.toContain('test.md');
        
        // Disable validation and make sure it now validates ok
        setup.validate.filesContent.tabsForbidden.enabled = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        setup.validate.filesContent.tabsForbidden.affectedPaths = [];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        setup.validate.filesContent.tabsForbidden.excludes = [];        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        // Delete the validation rule and make sure it now fails
        delete setup.validate.filesContent.tabsForbidden.enabled;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('filesContent.tabsForbidden requires property "enabled"');
        
        delete setup.validate.filesContent.tabsForbidden;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('File contains tabulations');
    });
    
    
    it('should validate ok a newly generated server_php project', function() {

        testsGlobalHelper.generateProjectAndSetup('server_php', null, []);
        
        let buildResult = testsGlobalHelper.execTbCmd('-l');
        expect(buildResult).toContain("validate start");
        expect(buildResult).toContain("validate ok");
    });
    
    
    it('should tell that PHP namespace properties are mandatory on turbobuilder setup file when namespaces.enabled is set to true', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        // Enable the namespaces validation
        setup.validate.php.namespaces.enabled = true;
        setup.validate.php.namespaces.mandatory = true;
        setup.validate.php.namespaces.mustContain = [];
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
        
        delete setup.validate.php.namespaces.mandatory;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let execResult = testsGlobalHelper.execTbCmd('-l');
        expect(execResult).toContain('Invalid JSON schema for turbobuilder.json');
        expect(execResult).toContain('instance.validate.php.namespaces requires property "mandatory"');
        
        setup.validate.php.namespaces.mandatory = true;
        delete setup.validate.php.namespaces.mustContain;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        execResult = testsGlobalHelper.execTbCmd('-l');
        expect(execResult).toContain('Invalid JSON schema for turbobuilder.json');
        expect(execResult).toContain('instance.validate.php.namespaces requires property "mustContain"');
        
        setup.validate.php.namespaces.mustContain = [];
        delete setup.validate.php.namespaces.excludes;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        execResult = testsGlobalHelper.execTbCmd('-l');
        expect(execResult).toContain('Invalid JSON schema for turbobuilder.json');
        expect(execResult).toContain('instance.validate.php.namespaces requires property "excludes"');
    });  
    
    
    it('should allow avoiding the definition of PHP namespace properties on turbobuilder setup file when namespaces.enabled is set to false', function() {
    
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        // Enable the namespaces validation
        setup.validate.php.namespaces.enabled = false;
        delete setup.validate.php.namespaces.mandatory;
        delete setup.validate.php.namespaces.mustContain;
        delete setup.validate.php.namespaces.excludes;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
    });
    
    
    it('should fail validation when PHP files contain invalid namespace definitions', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain('validate ok');
       
        // Enable the namespaces validation
        setup.validate.php.namespaces.enabled = true;
        setup.validate.php.namespaces.mandatory = true;
        setup.validate.php.namespaces.mustContain = ["org\\libname\\src\\$path"];
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let execResult = testsGlobalHelper.execTbCmd('-l');
        
        expect(execResult).toContain('File does not contain a namespace declaration');
        expect(execResult).toContain('src\\main\\php\\autoloader.php');
        expect(execResult).not.toContain('Namespace error');
        expect(execResult).toContain('SomeManager.php');
        
        setup.validate.php.namespaces.excludes = ["autoloader.php", "index.php"];
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        execResult = testsGlobalHelper.execTbCmd('-l');
        
        expect(execResult).toContain('File does not contain a namespace declaration');
        expect(execResult).not.toContain('src\\main\\php\\autoloader.php');
        expect(execResult).not.toContain('Namespace error');
        expect(execResult).toContain('SomeManager.php');
        
        expect(fm.saveFile('./src/main/php/managers/SomeManager.php',
            "<?php namespace org\\libname\\src\\main\\php\\managers; class SomeManager {} ?>")).toBe(true);
        
        expect(fm.saveFile('./src/main/php/model/SomeClass.php',
            "<?php namespace org\\libname\\src\\main\\php\\model; class SomeClass {} ?>")).toBe(true);
        
        expect(fm.saveFile('./src/main/php/utils/SomeUtils.php',
            "<?php namespace org\\libname\\src\\main\\php\\utils; class SomeUtils {} ?>")).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
    
    it('should validate ok a newly generated app_node_cmd project', function() {

        testsGlobalHelper.generateProjectAndSetup('app_node_cmd', null, []);
        
        let buildResult = testsGlobalHelper.execTbCmd('-l');
        expect(buildResult).toContain("validate start");
        expect(buildResult).toContain("validate ok");
    });
    
    
    it('should correctly validate a newly generated site_php project without duplicate code verification', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(setup.validate.filesContent.copyPasteDetect.length).toBe(0);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        
        expect(lintResult).not.toContain("Looking for duplicate code");
        expect(lintResult).toContain("validate ok");
    });
    
    
    it('should correctly validate a newly generated site_php project without duplicate code exceeding the threshold. Report must be generated if configured, and not if not configured', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, null);
        
        this.testCopyPasteDetectSetupIsValid(setup);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-l'),
            ["Looking for duplicate code on",
             "Percentage of duplicate code: 0 (maximum allowed: 0)",
             "Percentage of duplicate code: 0 (maximum allowed: 0)",
             "validate ok"]);
                
        expect(fm.isDirectory('./src')).toBe(true);
        expect(fm.isDirectory('./target')).toBe(false);
        
        // Enable the copy paste report generation
        
        setup.validate.filesContent.copyPasteDetect[0].report = 'html';
        setup.validate.filesContent.copyPasteDetect[1].report = 'html';
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-l'),
            ["Looking for duplicate code on",
             "Percentage of duplicate code: 0 (maximum allowed: 0)",
             "Percentage of duplicate code: 0 (maximum allowed: 0)",
             "validate ok"]);
                
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());

        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-main/html/index.html')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-test/html/index.html')).toBe(true);
        
        setup.validate.filesContent.copyPasteDetect[0].maxPercentErrorLevel = 4;
        setup.validate.filesContent.copyPasteDetect[1].maxPercentErrorLevel = 10;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-l'),
            ["Looking for duplicate code on",
             "Percentage of duplicate code: 0 (maximum allowed: 4)",
             "The percentage of duplicate code on the project is 0 which is too below from"]);
    });
    
    
    it('should fail validation for a site_php project which contains upper case characters on the view folders', function() {

        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        expect(fm.createDirectory('./src/main/view/views/someView')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("someView view folder must be lower case");
    });
    
    
    it('should fail validation for a site_php project when view files are missing', function() {

        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        expect(fm.createDirectory('./src/main/view/views/someview')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("someview.js does not exist for view someview");
        
        expect(fm.saveFile('./src/main/view/views/someview/someview.js')).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("someview.php does not exist for view someview");
        
        expect(fm.saveFile('./src/main/view/views/someview/someview.php')).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("someview.scss does not exist for view someview");
        
        expect(fm.saveFile('./src/main/view/views/someview/someview.scss')).toBe(true);
        
        let lintResult = testsGlobalHelper.execTbCmd('-l');
        expect(lintResult).toContain("someview view must start with:");
        expect(lintResult).toMatch(/someview view structure php or html tags are incorrect, please fix them:[\s\S]*view.views.someview.someview.php/);
        expect(lintResult).toMatch(/someview view must end with [\s\S]*view.views.someview.someview.php/);
        expect(lintResult).toContain("File must start with \"use strict\":");
    });
    
    
    it('should fail validation for a site_php project when upper case characters are found inside a view folder', function() {

        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        expect(fm.createDirectory('./src/main/view/views/someview')).toBe(true);
        expect(fm.saveFile('./src/main/view/views/someview/someview.php')).toBe(true);
        expect(fm.saveFile('./src/main/view/views/someview/someview.js', '"use strict"')).toBe(true);
        expect(fm.saveFile('./src/main/view/views/someview/someview.Scss')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/Expected lower case file extension[\s\S]*view.views.someview.someview.Scss/);
        
        expect(fm.deleteFile('./src/main/view/views/someview/someview.Scss')).toBe(true);
        expect(fm.saveFile('./src/main/view/views/someview/someView.scss')).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/All files inside the someview view folder must be lower case[\s\S]*view.views.someview/);
    });
    
    
    it('should fail validation for a site_php project when view code starts with unexpected code', function() {

        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        let homeContent = StringUtils.replace(fm.readFile('./src/main/view/views/home/home.php'), 'WebSiteManager::getInstance()' , 'WebSiteManager::getIn1stance()');
        
        expect(fm.saveFile('./src/main/view/views/home/home.php', homeContent)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("home view must start with: <?php use ");
    });
    
    
    it('should fail validation for a site_php project when some of the html tags are incorrect at the view code', function() {

        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        let homeContent = StringUtils.replace(fm.readFile('./src/main/view/views/home/home.php'), '<body>' , '<bodY>');
        
        expect(fm.saveFile('./src/main/view/views/home/home.php', homeContent)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/home view structure php or html tags are incorrect, please fix them:[\s\S]*view.views.home.home.php/);
    });
    
    
    it('should fail validation for a site_php project when the view code ends with unexpected code', function() {

        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        let homeContent = StringUtils.replace(fm.readFile('./src/main/view/views/home/home.php'), '->echoHtmlJavaScriptTags()' , '->echoHtmlJavaScriptTag()');
        
        expect(fm.saveFile('./src/main/view/views/home/home.php', homeContent)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/home view must end with <\?php \$ws->[\s\S]*view.views.home.home.php/);
    });
    
    
    it('should fail validation for a newly generated lib_js project containing duplicate code. Report must be generated if configured, and not if not configured', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, null);
        
        this.testCopyPasteDetectSetupIsValid(setup);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-l'), [
            "Looking for duplicate code on",
            "Percentage of duplicate code: 0 (maximum allowed: 0)",
            "validate ok"]);
        
        // Duplicate a js file and run validation again
        
        expect(fm.copyFile('src/main/js/managers/MyInstantiableClass.js', 'src/main/js/managers/MyInstantiableClass2.js')).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-l'), ["ERROR: jscpd found too many duplicates"]);
        
        expect(fm.isDirectory('./src')).toBe(true);
        expect(fm.isDirectory('./target')).toBe(false);
        
        // Enable the copy paste report generation
        
        setup.validate.filesContent.copyPasteDetect[0].report = 'html';
        setup.validate.filesContent.copyPasteDetect[1].report = 'html';
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-l'), ["ERROR: jscpd found too many duplicates"]);
         
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());

        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-main/html/index.html')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-test/html/index.html')).toBe(false);
    });
    
    
    it('should generate duplicate code reports for a newly generated lib_php project when clean and validation are performed at the same time', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, null);
        
        this.testCopyPasteDetectSetupIsValid(setup);
        
        // Enable the copy paste html report generation
        setup.validate.filesContent.copyPasteDetect[0].report = 'html';
        setup.validate.filesContent.copyPasteDetect[1].report = 'html';
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-cl'),
            ["clean ok",
             "Looking for duplicate code",
             "Percentage of duplicate code: 0 (maximum allowed: 0)",
             "validate ok"]);
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());

        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-main/html/index.html')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-test/html/index.html')).toBe(true);
    });
    
    
    it('should generate duplicate code reports for a newly generated lib_ts project when clean, build and validation are performed', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, null);
        
        this.testCopyPasteDetectSetupIsValid(setup);
        
        // Enable the copy paste report generation
        
        setup.validate.filesContent.copyPasteDetect[0].report = 'html';
        setup.validate.filesContent.copyPasteDetect[1].report = 'html';
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-cbl'), [
            "clean ok",
            "Looking for duplicate code",
            "Percentage of duplicate code: 0 (maximum allowed: 0)",
            "validate ok",
            "build ok"]);
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());

        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-main/html/index.html')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-test/html/index.html')).toBe(false);
        
        // Note that the previous expect gives a false value cause there's no code to analyze on the test folder, and so the copypaste detector does not generate any report.
        // So we will copy now the index.ts file into the test folder and test that the report is now correctly generated
        expect(fm.copyFile('./src/main/ts/index.ts', './src/test/ts/index.ts')).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-cbl'), [
            "clean ok",
            "Looking for duplicate code",
            "Percentage of duplicate code: 0 (maximum allowed: 0)",
            "validate ok",
            "build ok"]);
        
        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-test/html/index.html')).toBe(true);
    });
    
    
    it('should generate duplicate code reports for a newly generated lib_ts project when clean, release and validation are performed', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, null);
        
        this.testCopyPasteDetectSetupIsValid(setup);
        
        // Enable the copy paste report generation
        
        setup.validate.filesContent.copyPasteDetect[0].report = 'html';
        setup.validate.filesContent.copyPasteDetect[1].report = 'html';
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-crl'), [
            "clean ok",
            "Looking for duplicate code",
            "Percentage of duplicate code: 0 (maximum allowed: 0)",
            "validate ok",
            "release ok"]);
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());

        expect(fm.isFile('./target/' + folderName + '-0.0.0/reports/copypaste/src-main/html/index.html')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '-0.0.0/reports/copypaste/src-test/html/index.html')).toBe(false);
        
        // Note that the previous expect gives a false value cause there's no code to analyze on the test folder, and so the copypaste detector does not generate any report.
        // So we will copy now the index.ts file into the test folder and test that the report is now correctly generated
        expect(fm.copyFile('./src/main/ts/index.ts', './src/test/ts/index.ts')).toBe(true);
        
        stringTestsManager.assertTextContainsAll(testsGlobalHelper.execTbCmd('-cbl'), [
            "clean ok",
            "Looking for duplicate code",
            "Percentage of duplicate code: 0 (maximum allowed: 0)",
            "validate ok",
            "build ok"]);
        
        expect(fm.isFile('./target/' + folderName + '/reports/copypaste/src-test/html/index.html')).toBe(true);
    });
});
