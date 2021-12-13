'use strict';


/**
 * Tests related to the build feature of the cmd app
 */


require('./../../../main/js/globals');
const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');
const { TurboSiteTestsManager } = require('turbotesting-node');

const fm = new FilesManager();
const terminalManager = new TerminalManager();
const tsm = new TurboSiteTestsManager('./');


describe('cmd-parameter-build', function() {
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-build');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });
    
    it('should fail when -b and --build arguments are executed on an empty folder', function() {

        expect(testsGlobalHelper.execTbCmd('-b')).toContain(global.fileNames.setup + ' setup file not found');
        expect(testsGlobalHelper.execTbCmd('--build')).toContain(global.fileNames.setup + ' setup file not found');
    });
    
    
    it('should fail when -b and --build arguments are executed on an empty setup file structure', function() {

        testsGlobalHelper.generateProjectAndSetup('lib_ts', {}, []);
        
        // These regexps make sure that the last message from the exec result is the expected error and nothing more comes after
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/^[\s\S]*No valid project type specified.*under build section in turbobuilder.json[\s\S]*$/);
        expect(testsGlobalHelper.execTbCmd('--build')).toMatch(/^[\s\S]*No valid project type specified.*under build section in turbobuilder.json[\s\S]*$/);
    });
    
    
    it('should fail when more than one project type are defined on setup file', function() {
    
        testsGlobalHelper.generateProjectAndSetup('lib_ts', {lib_ts: {}, lib_php: {}}, []);

        expect(testsGlobalHelper.execTbCmd('-b')).toContain('Please specify only one of the following on build setup');
        expect(testsGlobalHelper.execTbCmd('--build')).toContain('Please specify only one of the following on build setup');
    });
    
    
    it('should fail with no files to build when build is executed after enabling ts build with no ts files', function() {
    
        testsGlobalHelper.generateProjectAndSetup('lib_ts', {lib_ts: {}}, []);
        
        // Delete the src ts folder
        expect(fm.deleteDirectory('.' + fm.dirSep() + 'src' + fm.dirSep() + 'main' + fm.dirSep() + 'ts', false))
            .toBeGreaterThan(0);

        // These regexps make sure that the last message from the exec result is the expected error and nothing more comes after
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/[\s\S]*no files to build[\s\S]{0,5}$/);
        expect(testsGlobalHelper.execTbCmd('--build')).toMatch(/[\s\S]*no files to build[\s\S]{0,5}$/);
    });
    
    
    it('should fail build when a lib_ts project contains a typescript file with compilation errors', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
               
        expect(fm.saveFile('./src/main/ts/index.ts', 'let a = 1; a = "string";')).toBe(true);
        
        let buildResult = testsGlobalHelper.execTbCmd('-b');
        
        expect(buildResult).toContain('Typescript compilation failed');
        expect(buildResult).toContain('Type \'"string"\' is not assignable to type \'number\'');
        
        expect(fm.isFile('./target/' + folderName + '/dist/es5/PackedJsFileName-ES5.js')).toBe(false);
        expect(fm.isFile('./target/' + folderName + '/dist/es6/PackedJsFileName-ES6.js')).toBe(false);
        expect(fm.isFile('./target/' + folderName + '/dist/ts/index.js')).toBe(true);
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_ts structure with some ts files', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
               
        expect(fm.saveFile('./src/main/ts/index.ts', '')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.isFile('./target/' + folderName + '/dist/es5/PackedJsFileName-ES5.js')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/es6/PackedJsFileName-ES6.js')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/ts/index.js')).toBe(true);
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_js structure', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.isDirectory('./target/' + folderName + '/dist/resources')).toBe(true);
        expect(fm.isDirectory('./target/' + folderName + '/dist/js')).toBe(false);
        expect(fm.isFile('./target/' + folderName + '/dist/index.js')).toBe(false);
        expect(fm.isFile('./target/' + folderName + '/dist/' + folderName + '.js')).toBe(true);
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_js structure and deleteNonMergedJs is false', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        setup.build.lib_js.deleteNonMergedJs = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.isDirectory('./target/' + folderName + '/dist/resources')).toBe(true);
        expect(fm.isDirectory('./target/' + folderName + '/dist/js')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/index.js')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/js/managers/MyInstantiableClass.js')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/js/utils/MyStaticClass.js')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/' + folderName + '.js')).toBe(true);
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_js structure and createMergedFile is false', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        setup.build.lib_js.createMergedFile = false;        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.isDirectory('./target/' + folderName + '/dist/resources')).toBe(true);
        expect(fm.isDirectory('./target/' + folderName + '/dist/js')).toBe(false);
        expect(fm.isFile('./target/' + folderName + '/dist/index.js')).toBe(false);
        expect(fm.isFile('./target/' + folderName + '/dist/' + folderName + '.js')).toBe(false);
    });
    
    
    it('should correctly build a lib_js when mergeFileName is specified on setup', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        setup.build.lib_js.mergedFileName = "SomeMergeFileName";
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.isFile('./target/' + folderName + '/dist/SomeMergeFileName.js')).toBe(true);
        
        let mergedFileContents = fm.readFile('./target/' + folderName + '/dist/SomeMergeFileName.js');
        
        expect(mergedFileContents).toContain('this will be the main library entry point');
        expect(mergedFileContents).toContain('MyInstantiableClass');
        expect(mergedFileContents).toContain('MyExtendedClass');
        expect(mergedFileContents).toContain('MySingletonClass');
    });
    
    
    it('should create phar file when -b argument is executed after generating a lib_php project structure with some php files', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        
        expect(fm.saveFile('./src/main/php/autoloader.php', '<?php ?>')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
  
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        expect(fm.isFile('./target/' + folderName  + '/dist/' + folderName  + '-0.0.0.phar')).toBe(true);
    });
    
    
    it('should build ok when -b argument is executed on a generated site_php project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(true);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        
        let buildResult = testsGlobalHelper.execTbCmd('-b');
        
        expect(buildResult).toContain('build start: site_php');
        expect(buildResult).toContain('build ok');
        
        // Test that generated favicon files are correct
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let buildRoot = '.' + sep + 'target' + sep + folderName + sep + 'dist' + sep + 'site';
        let buildSetup = tsm.getSetupFromIndexPhp('turbosite', buildRoot + sep + 'index.php');
        
        expect(fm.isFile(`${buildRoot}${sep}196x196-${buildSetup.cacheHash}.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}apple-touch-icon-180x180.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}apple-touch-icon-precomposed.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}apple-touch-icon.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}apple-touch-icon-152x152.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}apple-touch-icon-144x144.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}128x128-${buildSetup.cacheHash}.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}apple-touch-icon-114x114.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}96x96-${buildSetup.cacheHash}.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}apple-touch-icon-76x76.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}apple-touch-icon-57x57.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}32x32-${buildSetup.cacheHash}.png`)).toBe(true);
        expect(fm.isFile(`${buildRoot}${sep}16x16-${buildSetup.cacheHash}.png`)).toBe(true);
    });
    
    
    it('should show a warning when no favicons are defined on a site_php project', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(fm.deleteFile('./src/main/resources/favicons/196x196.png')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('Warning: No favicons specified');
    });
    
    
    it('should fail when a non expected favicon is found on a site_php project', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(fm.saveFile('./src/main/resources/favicons/196x191.png', 'test')).toBe(true);
        
        // This regexp makes sure that the last message from the exec result is the expected error and nothing more comes after
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/[\s\S]*Unexpected favicon name: 196x191.png[\s\S]{0,5}$/);
    });
    
    
    it('should fail when a non existant global js file is defined on turbosite.json file for a site_php project', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tsSetup = tsm.getSetup('turbosite');
        tsSetup.globalJs.push("libs/nofile.js");
        expect(testsGlobalHelper.saveToSetupFile(tsSetup, 'turbosite.json')).toBe(true);
        
        // This regexp makes sure that the last message from the exec result is the expected error and nothing more comes after
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/[\s\S]*Error loading global JS file. Make sure the path on turbosite.json is correct for[\s\S]*nofile.js/);
    });
    
    
    it('should inject globalHtml code to all the project views when "*" is specified and configured to be at the start of the head tag', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        let pathToTargetViews = './target/' + tsm.getProjectname() + '/dist/site/view/views';
        
        // Create an html file with the code to inject on the views
        expect(fm.saveFile('./src/main/view/components/rawhtml/rawhtml.html', '<p>hello world</p>', false, true)).toBe(true);
        
        // Check that compiled views do not have the compiled code
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        expect(fm.readFile(pathToTargetViews + '/home/home.php')).not.toContain('<head>\n<p>hello world</p>');
        expect(fm.readFile(pathToTargetViews + '/multi-parameters/multi-parameters.php')).not.toContain('<head>\n<p>hello world</p>');
        
        // Enable the global html injection on the turbosite setup
        let tsSetup = tsm.getSetup('turbosite');
        
        tsSetup.globalHtml = [{
            affectedViews: ["*"],
            element: "head",
            codePlacement: "start",
            path: "view/components/rawhtml/rawhtml.html"
        }];
        
        expect(testsGlobalHelper.saveToSetupFile(tsSetup, 'turbosite.json')).toBe(true);
        
        // Check that html code has been injected
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        expect(fm.readFile(pathToTargetViews + '/home/home.php')).toContain('<head>\n<p>hello world</p>');
        expect(fm.readFile(pathToTargetViews + '/multi-parameters/multi-parameters.php')).toContain('<head>\n<p>hello world</p>');
        
        // Remove the global injection from setup and check again that the code is now not present on the views
        tsSetup.globalHtml = [];
        expect(testsGlobalHelper.saveToSetupFile(tsSetup, 'turbosite.json')).toBe(true);
        
        // Check that html code has NOT been injected
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        expect(fm.readFile(pathToTargetViews + '/home/home.php')).not.toContain('<head>\n<p>hello world</p>');
        expect(fm.readFile(pathToTargetViews + '/multi-parameters/multi-parameters.php')).not.toContain('<head>\n<p>hello world</p>');
    });
    
    
    it('should inject globalHtml code to all the project views when "*" is specified and configured to be at the end of the body tag', function() {
        
        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        let pathToTargetViews = './target/' + tsm.getProjectname() + '/dist/site/view/views';
        
        // Create an html file with the code to inject on the views
        expect(fm.saveFile('./src/main/view/components/rawhtml/rawhtml.html', '<p>bye world</p>', false, true)).toBe(true);
        
        // Check that compiled views do not have the compiled code
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        expect(fm.readFile(pathToTargetViews + '/home/home.php')).not.toContain('<p>bye world</p>');
        expect(fm.readFile(pathToTargetViews + '/multi-parameters/multi-parameters.php')).not.toContain('<p>bye world</p>');
        
        // Enable the global html injection on the turbosite setup
        let tsSetup = tsm.getSetup('turbosite');
        
        tsSetup.globalHtml = [{
            affectedViews: ["*"],
            element: "body",
            codePlacement: "end",
            path: "view/components/rawhtml/rawhtml.html"
        }];
        
        expect(testsGlobalHelper.saveToSetupFile(tsSetup, 'turbosite.json')).toBe(true);
        
        // Check that html code has been injected
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        expect(fm.readFile(pathToTargetViews + '/home/home.php')).toContain('<p>bye world</p>\n</body>');
        expect(fm.readFile(pathToTargetViews + '/multi-parameters/multi-parameters.php')).toContain('<p>bye world</p>\n</body>');
    });
    
    
    it('should fail site_php project build when globalHtml code path points to an invalid file', function() {
    
        testsGlobalHelper.generateProjectAndSetup('site_php');
        
        // Enable the global html injection on the turbosite setup with an invalid path
        let tsSetup = tsm.getSetup('turbosite');
        
        tsSetup.globalHtml = [{
            affectedViews: ["*"],
            element: "body",
            codePlacement: "end",
            path: "view/components/invalidhtml.html"
        }];
        
        expect(testsGlobalHelper.saveToSetupFile(tsSetup, 'turbosite.json')).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/Error loading globalHtml path for <body>: Error: File does not exist:.*invalidhtml.html/);
    });
    
    
    it('should build ok when -b argument is executed on a generated server_php project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('server_php', null, []);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('server_php')).toBe(true);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
    });
    
    
    it('should build ok when -b argument is executed on a generated app_node_cmd project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('app_node_cmd', null, []);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('server_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.build.hasOwnProperty('app_node_cmd')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok (no files affected or created)');
    });
        
    
    it('should replace all wildcard matches with project version on all configured file extensions', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "versionWildCard":{
                "enabled": true,       
                "wildCard": "@@--build-version--@@",
                "code":{
                    "includes": [".js", ".php", ".json"]
                },
                "files": {
                    "includes": []   
                }
            }
        };
        
        setup.validate.php.namespaces.enabled = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        testsGlobalHelper.generateSitePhpFilesWithWildcard('@@--build-version--@@');
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t0.php')).toBe('<?php // 1 - 0.0.0 2 - 0.0.0 ?>');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t1.php')).toBe('<?php $1 = "0.0.0"; $2 = "0.0.0" ?>');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t2.js')).toBe('"use strict";var a = "0.0.0"; var b = "0.0.0";// a - 0.0.0 b - 0.0.0');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t3.json')).toBe('{ "a": "0.0.0", "b": "0.0.0"}');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t4.txt')).toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
    });
    
    
    it('should NOT replace wildcard matches with project version on configured file extensions when wildcard is set to empty string', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.validate.php.namespaces.enabled = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        testsGlobalHelper.generateSitePhpFilesWithWildcard('@@--build-version--@@');
        
        // wildCards.versionWildCard.enabled is false by default, so no replacement must happen
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t0.php'))
            .toBe('<?php // 1 - @@--build-version--@@ 2 - @@--build-version--@@ ?>');
            
        expect(fm.readFile('./target/' + folderName + '/dist/site/t1.php'))
            .toBe('<?php $1 = "@@--build-version--@@"; $2 = "@@--build-version--@@" ?>');
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t2.js'))
            .toBe('"use strict";var a = "@@--build-version--@@"; var b = "@@--build-version--@@";// a - @@--build-version--@@ b - @@--build-version--@@');
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t3.json'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        // We will now enable versionWildCard and set an empty wildcard. No replacement must happen
        setup = tsm.getSetup('turbobuilder');
        
        setup.wildCards = {
            "versionWildCard":{
                "enabled": true,         
                "wildCard": "",
                "code":{
                    "includes": [".js", ".php", ".json"]
                },
                "files": {
                    "includes": []   
                }
            }
        };
             
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
                
        expect(fm.readFile('./target/' + folderName + '/dist/site/t0.php'))
            .toBe('<?php // 1 - @@--build-version--@@ 2 - @@--build-version--@@ ?>');
            
        expect(fm.readFile('./target/' + folderName + '/dist/site/t1.php'))
            .toBe('<?php $1 = "@@--build-version--@@"; $2 = "@@--build-version--@@" ?>');
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t2.js'))
            .toBe('"use strict";var a = "@@--build-version--@@"; var b = "@@--build-version--@@";// a - @@--build-version--@@ b - @@--build-version--@@');
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t3.json'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
    });
    
    
    it('should replace wildcards with their BUILD value on the turbobuilder.json setup when a build is performed', function() {
    
        // The turbobuilder.json file allows to define wildcards to be replaced on the setup itself with different values when build or release is executed.
        // This test checks that this works ok
        
        // TODO - This test is a bit more complex so we leave it pending      
    });
    
    
    it('should replace wildcards with their BUILD value on the turbodepot.json setup when a build is performed', function() {
    
        // The turbobuilder.json file allows to define wildcards to be replaced on the setup files with different values when build or release is executed.
        // This test checks that this works ok
        
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "setupWildCards": [{
                "enabled": true,
                "wildCard": "$somewildcard",
                "buildValue": "wildcard-build-value",
                "releaseValue": "wildcard-release-value"
            }]};
        
        expect(fm.saveFile('.' + sep + 'turbobuilder.json', JSON.stringify(setup))).toBe(true);
        
        let tdSetup = JSON.parse(fm.readFile('.' + sep + 'turbodepot.json'));
        tdSetup.depots[0].name = "$somewildcard";
        tdSetup.sources.fileSystem[0].name = "$somewildcard";
        expect(fm.saveFile('.' + sep + 'turbodepot.json', JSON.stringify(tdSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain("build ok");
        
        let indexPhpSetup = tsm.getSetupFromIndexPhp('turbodepot', './target/' + folderName + '/dist/site/index.php');

        expect(indexPhpSetup.depots[0].name).toBe("wildcard-build-value");
        expect(indexPhpSetup.sources.fileSystem[0].name).toBe("wildcard-build-value");
        expect(indexPhpSetup.hasOwnProperty('wildCards')).toBe(false);  
    }); 
    
    
    it('should replace wildcards with their BUILD value on the turbosite.json setup when a build is performed', function() {
    
        // The turbobuilder.json file allows to define wildcards to be replaced on the setup files with different values when build or release is executed.
        // This test checks that this works ok
        
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "setupWildCards": [{
                "enabled": true,
                "wildCard": "$somewildcard",
                "buildValue": "wildcard-build-value",
                "releaseValue": "wildcard-release-value"
            }]};
        
        expect(fm.saveFile('.' + sep + 'turbobuilder.json', JSON.stringify(setup))).toBe(true);
        
        let tsSetup = JSON.parse(fm.readFile('.' + sep + 'turbosite.json'));
        tsSetup.baseURL = "$somewildcard";
        tsSetup.locales[0] = "$somewildcard";
        expect(fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(tsSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain("build ok");
        
        let indexPhpSetup = tsm.getSetupFromIndexPhp('turbosite', './target/' + folderName + '/dist/site/index.php');

        expect(indexPhpSetup.baseURL).toBe("wildcard-build-value");
        expect(indexPhpSetup.locales[0]).toBe("wildcard-build-value");
        expect(indexPhpSetup.hasOwnProperty('wildCards')).toBe(false);  
    });
    
    
    it('should replace code wildcards with their BUILD value on the code for the specified files when a build is performed', function() {
    
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "codeWildCards": [{
                "enabled": true,
                "wildCard": "$somewildcard",
                "buildValue": "wildcard-build-value",
                "releaseValue": "wildcard-release-value",
                "includes": [".php", ".js", ".json"]
            }]};
        
        setup.validate.php.namespaces.enabled = false;
        expect(fm.saveFile('.' + sep + 'turbobuilder.json', JSON.stringify(setup))).toBe(true);
        
        testsGlobalHelper.generateSitePhpFilesWithWildcard('$somewildcard');
        
        let execResult = testsGlobalHelper.execTbCmd('-b');       
        
        expect(execResult).toContain("replaced code wildcards on 4 files");
        expect(execResult).toContain("build ok");
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t0.php')).toBe('<?php // 1 - wildcard-build-value 2 - wildcard-build-value ?>');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t1.php')).toBe('<?php $1 = "wildcard-build-value"; $2 = "wildcard-build-value" ?>');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t2.js')).toBe('"use strict";var a = "wildcard-build-value"; var b = "wildcard-build-value";// a - wildcard-build-value b - wildcard-build-value');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t3.json')).toBe('{ "a": "wildcard-build-value", "b": "wildcard-build-value"}');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t4.txt')).toBe('{ "a": "$somewildcard", "b": "$somewildcard"}');
    });
    
    
    it('should NOT replace code wildcards with their BUILD value on the code for the specified files when a build is performed and code wildcard is disabled', function() {
    
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "codeWildCards": [{
                "enabled": false,
                "wildCard": "$somewildcard",
                "buildValue": "wildcard-build-value",
                "releaseValue": "wildcard-release-value",
                "includes": [".php", ".js", ".json"]
            }]};
        
        setup.validate.php.namespaces.enabled = false;
        expect(fm.saveFile('.' + sep + 'turbobuilder.json', JSON.stringify(setup))).toBe(true);
        
        testsGlobalHelper.generateSitePhpFilesWithWildcard('$somewildcard');
        
        let execResult = testsGlobalHelper.execTbCmd('-b');       
        
        expect(execResult).toContain("replaced code wildcards on 0 files");
        expect(execResult).toContain("build ok");
        
        expect(fm.readFile('./target/' + folderName + '/dist/site/t0.php')).toBe('<?php // 1 - $somewildcard 2 - $somewildcard ?>');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t1.php')).toBe('<?php $1 = "$somewildcard"; $2 = "$somewildcard" ?>');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t2.js')).toBe('"use strict";var a = "$somewildcard"; var b = "$somewildcard";// a - $somewildcard b - $somewildcard');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t3.json')).toBe('{ "a": "$somewildcard", "b": "$somewildcard"}');
        expect(fm.readFile('./target/' + folderName + '/dist/site/t4.txt')).toBe('{ "a": "$somewildcard", "b": "$somewildcard"}');
    });
    
    
    it('should add project version before all file extension on all files that are specified by extensions', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "versionWildCard":{
                "enabled": true,         
                "wildCard": "",
                "code":{
                    "includes": []
                },
                "files": {
                    "includes": ['.test']    
                }
            }
        };
        
        setup.validate.php.namespaces.enabled = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(fm.saveFile('./src/main/a.test', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/b.test', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/c.test', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/a.txt', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/b.txt', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/c.txt', 'some content')).toBe(true);
        
        let buildResult = testsGlobalHelper.execTbCmd('-b');
        expect(buildResult).toMatch(/replaced project version .* on 0 files/);
        expect(buildResult).toMatch(/renamed 3 files with project version 0.0.0/);
        
        expect(fm.isFile('./src/main/a.test')).toBe(true);
        expect(fm.isFile('./src/main/b.test')).toBe(true);
        expect(fm.isFile('./src/main/c.test')).toBe(true);
        expect(fm.isFile('./src/main/a.txt')).toBe(true);
        expect(fm.isFile('./src/main/b.txt')).toBe(true);
        expect(fm.isFile('./src/main/c.txt')).toBe(true);
        
        expect(fm.isFile('./target/' + folderName + '/dist/site/a.test')).toBe(false);
        expect(fm.isFile('./target/' + folderName + '/dist/site/a.test')).toBe(false);
        expect(fm.isFile('./target/' + folderName + '/dist/site/a.test')).toBe(false);
        
        expect(fm.isFile('./target/' + folderName + '/dist/site/a0.0.0.test')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/a0.0.0.test')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/a0.0.0.test')).toBe(true);
        
        expect(fm.isFile('./target/' + folderName + '/dist/site/a.txt')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/b.txt')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/c.txt')).toBe(true);
        
        expect(buildResult).toContain('build ok');
    });
    
    
    it('should add project version before all file extension on all files that are specified by extensions inside some arbitrary folders', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "versionWildCard":{
                "enabled": true,         
                "wildCard": "",
                "code":{
                    "includes": []
                },
                "files": {
                    "includes": ['.test']    
                }
            }
        };
        
        setup.validate.php.namespaces.enabled = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(fm.createDirectory('./src/main/folder1/folder2', true)).toBe(true);
        expect(fm.saveFile('./src/main/folder1/a.txt', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/b.txt', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/folder2/a.test', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/folder2/b.test', 'some content')).toBe(true);
        
        let buildResult = testsGlobalHelper.execTbCmd('-b');
        expect(buildResult).toMatch(/replaced project version .* on 0 files/);
        expect(buildResult).toMatch(/renamed 2 files with project version 0.0.0/);
        
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/a.txt')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/b.txt')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/folder2/a0.0.0.test')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/folder2/b0.0.0.test')).toBe(true);
        
        expect(buildResult).toContain('build ok');
    });
    
    
    it('should add project version before all file extension on all files that are specified by folder', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "versionWildCard":{
                "enabled": true,         
                "wildCard": "",
                "code":{
                    "includes": []
                },
                "files": {
                    "includes": ['folder1']    
                }
            }
        };
        
        setup.validate.php.namespaces.enabled = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(fm.createDirectory('./src/main/folder1/folder2', true)).toBe(true);
        expect(fm.saveFile('./src/main/folder1/a.txt', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/b.txt', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/folder2/a.test', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/folder2/b.test', 'some content')).toBe(true);
        
        let buildResult = testsGlobalHelper.execTbCmd('-b');
        expect(buildResult).toMatch(/replaced project version .* on 0 files/);
        expect(buildResult).toMatch(/renamed 4 files with project version 0.0.0/);
        
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/a0.0.0.txt')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/b0.0.0.txt')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/folder2/a0.0.0.test')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/folder2/b0.0.0.test')).toBe(true);
        
        expect(buildResult).toContain('build ok');
    });
    
    
    it('should add project version before all file extension on all files that are specified by subfolder', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.wildCards = {
            "versionWildCard":{
                "enabled": true,         
                "wildCard": "",
                "code":{
                    "includes": []
                },
                "files": {
                    "includes": ['folder1/folder2']    
                }
            }
        };
        
        setup.validate.php.namespaces.enabled = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        expect(fm.createDirectory('./src/main/folder1/folder2', true)).toBe(true);
        expect(fm.saveFile('./src/main/folder1/a.txt', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/b.txt', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/folder2/a.test', 'some content')).toBe(true);
        expect(fm.saveFile('./src/main/folder1/folder2/b.test', 'some content')).toBe(true);
        
        let buildResult = testsGlobalHelper.execTbCmd('-b');
        expect(buildResult).toMatch(/replaced project version .* on 0 files/);
        expect(buildResult).toMatch(/renamed 2 files with project version 0.0.0/);
        
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/a.txt')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/b.txt')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/folder2/a0.0.0.test')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/site/folder1/folder2/b0.0.0.test')).toBe(true);
        
        expect(buildResult).toContain('build ok');
        
        // Perform the same tests but using reverse slash \ as the folder divider. Both directory separators must work the same
        setup.wildCards.versionWildCard.files.includes = ['folder1\\folder2'];
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        buildResult = testsGlobalHelper.execTbCmd('-cb');
        expect(buildResult).toMatch(/replaced project version .* on 0 files/);
        expect(buildResult).toMatch(/renamed 2 files with project version 0.0.0/);
    });      
});