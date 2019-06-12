#!/usr/bin/env node

'use strict';


/**
 * Tests related to the build feature of the cmd app
 */


require('./../../../main/js/globals');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const utils = require('../cmd-parameter-test-utils');
const { StringUtils } = require('turbocommons-ts');
const { TerminalManager } = require('turbodepot-node');
const { TurboSiteTestsManager } = require('turbotesting-node');

const terminalManager = new TerminalManager();
const tsm = new TurboSiteTestsManager('./');


describe('cmd-parameter-build', function() {
    
    beforeEach(function() {
        
        this.workdir = terminalManager.createTempDirectory('test-build');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBeGreaterThan(-1);
    });
    
    it('should fail when -b and --build arguments are executed on an empty folder', function() {

        expect(utils.exec('-b')).toContain(global.fileNames.setup + ' setup file not found');
        expect(utils.exec('--build')).toContain(global.fileNames.setup + ' setup file not found');
    });
    
    
    it('should fail when -b and --build arguments are executed on an empty setup file structure', function() {

        utils.generateProjectAndSetTurbobuilderSetup('lib_ts', {}, []);
        
        expect(utils.exec('-b')).toContain('No valid project type specified');
        expect(utils.exec('--build')).toContain('No valid project type specified');
    });
    
    
    it('should fail when more than one project type are defined on setup file', function() {
    
        utils.generateProjectAndSetTurbobuilderSetup('lib_ts', {lib_ts: {}, lib_php: {}}, []);

        expect(utils.exec('-b')).toContain('Please specify only one of the following on build setup');
        expect(utils.exec('--build')).toContain('Please specify only one of the following on build setup');
    });
    
    
    it('should fail with no files to build when build is executed after enabling ts build with no ts files', function() {
    
        utils.generateProjectAndSetTurbobuilderSetup('lib_ts', {lib_ts: {}}, []);
        
        // Delete the src ts folder
        expect(utils.fm.deleteDirectory('.' + utils.fm.dirSep() + 'src' + utils.fm.dirSep() + 'main' + utils.fm.dirSep() + 'ts', false))
            .toBeGreaterThan(0);

        expect(utils.exec('-b')).toContain('no files to build');
        expect(utils.exec('--build')).toContain('no files to build');
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_ts structure with some ts files', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        utils.generateProjectAndSetTurbobuilderSetup('lib_ts', null, []);
               
        expect(utils.fm.saveFile('./src/main/ts/index.ts', '')).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.isFile('./target/' + folderName + '/dist/es5/PackedJsFileName-ES5.js')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/es6/PackedJsFileName-ES6.js')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/ts/index.js')).toBe(true);
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_js structure', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        utils.generateProjectAndSetTurbobuilderSetup('lib_js', null, []);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.isDirectory('./target/' + folderName + '/dist/resources')).toBe(true);
        expect(utils.fm.isDirectory('./target/' + folderName + '/dist/js')).toBe(false);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/index.js')).toBe(false);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/' + folderName + '.js')).toBe(true);
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_js structure and deleteNonMergedJs is false', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('lib_js', null, []);
        
        setup.build.lib_js.deleteNonMergedJs = false;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.isDirectory('./target/' + folderName + '/dist/resources')).toBe(true);
        expect(utils.fm.isDirectory('./target/' + folderName + '/dist/js')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/index.js')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/js/managers/MyInstantiableClass.js')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/js/utils/MyStaticClass.js')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/' + folderName + '.js')).toBe(true);
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_js structure and createMergedFile is false', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('lib_js', null, []);
        
        setup.build.lib_js.createMergedFile = false;        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.isDirectory('./target/' + folderName + '/dist/resources')).toBe(true);
        expect(utils.fm.isDirectory('./target/' + folderName + '/dist/js')).toBe(false);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/index.js')).toBe(false);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/' + folderName + '.js')).toBe(false);
    });
    
    
    it('should correctly build a lib_js when mergeFileName is specified on setup', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('lib_js', null, []);
        
        setup.build.lib_js.mergedFileName = "SomeMergeFileName";
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.isFile('./target/' + folderName + '/dist/SomeMergeFileName.js')).toBe(true);
        
        let mergedFileContents = utils.fm.readFile('./target/' + folderName + '/dist/SomeMergeFileName.js');
        
        expect(mergedFileContents).toContain('this will be the main library entry point');
        expect(mergedFileContents).toContain('MyInstantiableClass');
        expect(mergedFileContents).toContain('MyExtendedClass');
        expect(mergedFileContents).toContain('MySingletonClass');
    });
    
    
    it('should create phar file when -b argument is executed after generating a lib_php project structure with some php files', function() {
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('lib_php', null, []);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        
        expect(utils.fm.saveFile('./src/main/php/autoloader.php', '<?php ?>')).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
  
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.fm.isFile('./target/' + folderName  + '/dist/' + folderName  + '-0.0.0.phar')).toBe(true);
    });
    
    
    it('should build ok when -b argument is executed on a generated site_php project', function() {
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(true);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        
        let buildResult = utils.exec('-b');
        
        expect(buildResult).toContain('build start: site_php');
        expect(buildResult).toContain('build ok');
        
        // Test that generated favicon files are correct
        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        let buildRoot = '.' + sep + 'target' + sep + folderName + sep + 'dist' + sep + 'site';
        let buildSetup = tsm.getSetupFromIndexPhp('turbosite', buildRoot + sep + 'index.php');
        
        expect(utils.fm.isFile(`${buildRoot}${sep}196x196-${buildSetup.cacheHash}.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}apple-touch-icon-180x180.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}apple-touch-icon-precomposed.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}apple-touch-icon.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}apple-touch-icon-152x152.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}apple-touch-icon-144x144.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}128x128-${buildSetup.cacheHash}.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}apple-touch-icon-114x114.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}96x96-${buildSetup.cacheHash}.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}apple-touch-icon-76x76.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}apple-touch-icon-57x57.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}32x32-${buildSetup.cacheHash}.png`)).toBe(true);
        expect(utils.fm.isFile(`${buildRoot}${sep}16x16-${buildSetup.cacheHash}.png`)).toBe(true);
    });
    
    
    it('should show a warning when no favicons are defined on a site_php project', function() {
        
        utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        expect(utils.fm.deleteFile('./src/main/resources/favicons/196x196.png')).toBe(true);
        
        expect(utils.exec('-b')).toContain('Warning: No favicons specified');
    });
    
    
    it('should fail when a non expected favicon is found on a site_php project', function() {
        
        utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        expect(utils.fm.saveFile('./src/main/resources/favicons/196x191.png', 'test')).toBe(true);
        
        expect(utils.exec('-b')).toContain('Unexpected favicon name: 196x191.png');
    });
    
    
    it('should build ok when -b argument is executed on a generated server_php project', function() {
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('server_php', null, []);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('server_php')).toBe(true);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        
        expect(utils.exec('-b')).toContain('build ok');
    });
    
    
    it('should build ok when -b argument is executed on a generated app_node_cmd project', function() {
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('app_node_cmd', null, []);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('server_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.build.hasOwnProperty('app_node_cmd')).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok (no files affected or created)');
    });
        
    
    it('should replace all wildcard matches with project version on all configured file extensions', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        setup.build.replaceVersion.enabled = true;
        setup.validate.php.namespaces.enabled = false;
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.fm.saveFile('./src/main/t1.php', '<?php // 1 - @@--build-version--@@ 2 - @@--build-version--@@ ?>')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t2.js', '"use strict";// a - @@--build-version--@@ b - @@--build-version--@@')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t3.json', '{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t4.txt', '{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}')).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t1.php')).toBe('<?php // 1 - 0.0.0 2 - 0.0.0 ?>');
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t2.js')).toBe('"use strict";// a - 0.0.0 b - 0.0.0');
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t3.json')).toBe('{ "a": "0.0.0", "b": "0.0.0"}');
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t4.txt')).toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
    });
    
    
    it('should NOT replace wildcard matches on configured file extensions when wildcard is set to empty string', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        let setup = utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        setup.validate.php.namespaces.enabled = false;
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.fm.saveFile('./src/main/t1.php', '<?php // 1 - @@--build-version--@@ 2 - @@--build-version--@@ ?>')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t2.js', '"use strict";// a - @@--build-version--@@ b - @@--build-version--@@')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t3.json', '{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t4.txt', '{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}')).toBe(true);
        
        // replaceVersion.enabled is false by default, so no replacement must happen
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t1.php'))
            .toBe('<?php // 1 - @@--build-version--@@ 2 - @@--build-version--@@ ?>');
        
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t2.js'))
            .toBe('"use strict";// a - @@--build-version--@@ b - @@--build-version--@@');
        
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t3.json'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        // We will now enable replaceversion and set an empty wildcard. No replacement must happen
        setup = utils.readSetupFile();
        setup.build.replaceVersion.enabled = true;
        setup.build.replaceVersion.wildCard = "";        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
                
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t1.php'))
            .toBe('<?php // 1 - @@--build-version--@@ 2 - @@--build-version--@@ ?>');
        
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t2.js'))
            .toBe('"use strict";// a - @@--build-version--@@ b - @@--build-version--@@');
        
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t3.json'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        expect(utils.fm.readFile('./target/' + folderName + '/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
    });
});