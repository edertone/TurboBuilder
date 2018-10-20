#!/usr/bin/env node

'use strict';


/**
 * Tests related to the release feature of the cmd app
 */


require('./../../../main/js/globals');
const utils = require('../test-utils');
const { StringUtils } = require('turbocommons-ts');


describe('cmd-parameter-release', function() {
    
    beforeEach(function() {
        
        this.workdir = utils.createAndSwitchToTempFolder('test-release');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });
    
    
    it('should include project semver (0.0.0) inside all generated release merged JS on a non git project', function() {

        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let launchResult = utils.exec('-cr');        
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("changelog failed");
        expect(launchResult).toContain("release ok");
        expect(launchResult).toContain("0.0.0");
        
        let mergedContent = utils.fm.readFile(
            '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'es5' + sep + 'PackedJsFileName-ES5.js');
        
        expect(mergedContent.substr(0, 9)).toBe("// 0.0.0\n");
        
        mergedContent = utils.fm.readFile(
                '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'es6' + sep + 'PackedJsFileName-ES6.js');
            
        expect(mergedContent.substr(0, 9)).toBe("// 0.0.0\n");
    });
    
    
    it('should include project semver (0.4.0) inside all generated release merged JS on a lib_ts git project with created tags', function() {

        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        expect(utils.execCmdCommand('git init')).toContain("Initialized empty Git repository");
        utils.execCmdCommand('git add .');
        utils.execCmdCommand('git commit -m "test commit"');
        utils.execCmdCommand('git tag 0.1.0');
        
        utils.fm.saveFile('.' + sep + 'test.txt');
        utils.execCmdCommand('git add .');
        utils.execCmdCommand('git commit -m "test commit 2"');
        
        utils.execCmdCommand('git tag 0.4.0');
        
        let launchResult = utils.exec('-cr');        
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        expect(launchResult).toContain("0.4.0");
        
        let mergedContent = utils.fm.readFile(
            '.' + sep + 'target' + sep + folderName + '-0.4.0' + sep + 'dist' + sep + 'es5' + sep + 'PackedJsFileName-ES5.js');
        
        expect(mergedContent.substr(0, 9)).toBe("// 0.4.0\n");
        
        mergedContent = utils.fm.readFile(
                '.' + sep + 'target' + sep + folderName + '-0.4.0' + sep + 'dist' + sep + 'es6' + sep + 'PackedJsFileName-ES6.js');
            
        expect(mergedContent.substr(0, 9)).toBe("// 0.4.0\n");
    });
    
    
    it('should correctly generate release minifications for a site_php generated project', function() {
        
        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        let buildRoot = '.' + sep + 'target' + sep + folderName + sep + 'dist' + sep + 'site';
        let releaseRoot = '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'site';
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
                
        let launchResult = utils.exec('-cbr');
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        expect(launchResult).toContain("build start");
        expect(launchResult).toContain("build ok");
        
        expect(utils.fm.isDirectory(buildRoot)).toBe(true);
        expect(utils.fm.isDirectory(releaseRoot)).toBe(true);
        
        let buildSetup = JSON.parse(utils.fm.readFile(buildRoot + sep + 'turbosite.json'));
        let releaseSetup = JSON.parse(utils.fm.readFile(releaseRoot + sep + 'turbosite.json'));
        
        // Check that js files are smaller on release than on build
        let jsBuildFileSize = utils.fm.getFileSize(buildRoot + sep + 'glob-' + buildSetup.cacheHash + '.js');
        let jsReleaseFileSize = utils.fm.getFileSize(releaseRoot + sep + 'glob-' + releaseSetup.cacheHash + '.js');
        
        expect(jsBuildFileSize).toBeGreaterThan(0);
        expect(jsReleaseFileSize).toBeGreaterThan(0);
        expect(jsBuildFileSize).toBeGreaterThan(jsReleaseFileSize);
    
        // Check that css files are smaller on release than on build
        let cssBuildFileSize = utils.fm.getFileSize(buildRoot + sep + 'glob-' + buildSetup.cacheHash + '.css');
        let cssReleaseFileSize = utils.fm.getFileSize(releaseRoot + sep + 'glob-' + releaseSetup.cacheHash + '.css');
        
        expect(cssBuildFileSize).toBeGreaterThan(0);
        expect(cssReleaseFileSize).toBeGreaterThan(0);
        expect(cssBuildFileSize).toBeGreaterThan(cssReleaseFileSize);
    
        // Test that php files are smaller on release than on build
        let phpBuildFileSize = utils.fm.getFileSize(buildRoot + sep + 'index.php');
        let phpReleaseFileSize = utils.fm.getFileSize(releaseRoot + sep + 'index.php');
        
        expect(phpBuildFileSize).toBeGreaterThan(0);
        expect(phpReleaseFileSize).toBeGreaterThan(0);
        expect(phpBuildFileSize).toBeGreaterThan(phpReleaseFileSize);
        
        // Test that htaccess file is smaller on release than on build
        let htaccessBuildFileSize = utils.fm.getFileSize(buildRoot + sep + '..' + sep + '.htaccess');
        let htaccessReleaseFileSize = utils.fm.getFileSize(releaseRoot + sep + '..' + sep + '.htaccess');
        
        expect(htaccessBuildFileSize).toBeGreaterThan(0);
        expect(htaccessReleaseFileSize).toBeGreaterThan(0);
        expect(htaccessBuildFileSize).toBeGreaterThan(htaccessReleaseFileSize);

        // Check that apple touch icon size is smaller on release compilation
        let imgBuildFileSize = utils.fm.getFileSize(buildRoot + sep + 'apple-touch-icon.png');
        let imgReleaseFileSize = utils.fm.getFileSize(releaseRoot + sep + 'apple-touch-icon.png');
        
        expect(imgBuildFileSize).toBeGreaterThan(0);
        expect(imgReleaseFileSize).toBeGreaterThan(0);
        expect(imgBuildFileSize).toBeGreaterThan(imgReleaseFileSize);
        
        // TODO We must also test that jpg files are reduced in size
    });
    
    
    it('should correctly generate release for a lib_js project type when deleteNonMergedJs and deleteNonMergedJs are false', function() {
        
        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        let buildRoot = '.' + sep + 'target' + sep + folderName + sep + 'dist';
        let releaseRoot = '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist';
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        setup.build.lib_js.deleteNonMergedJs = false;
        setup.build.lib_js.createMergedFile = false;
        expect(utils.saveToSetupFile(setup)).toBe(true);
                
        let launchResult = utils.exec('-cr');
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release ok");
     
        expect(utils.fm.isDirectory(releaseRoot)).toBe(true);
        expect(utils.fm.isFile(releaseRoot + sep + folderName + '.js')).toBe(false);
        expect(utils.fm.isDirectory(releaseRoot + '/resources')).toBe(true);
        expect(utils.fm.isDirectory(releaseRoot + '/js')).toBe(true);
        expect(utils.fm.isFile(releaseRoot + '/index.js')).toBe(true);
        expect(utils.fm.isFile(releaseRoot + '/js/managers/MyInstantiableClass.js')).toBe(true);
        expect(utils.fm.isFile(releaseRoot + '/js/utils/MyStaticClass.js')).toBe(true);
    });
    
    
    it('should correctly generate release minifications for a lib_js generated project', function() {
        
        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        let buildRoot = '.' + sep + 'target' + sep + folderName + sep + 'dist';
        let releaseRoot = '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist';
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
                
        let launchResult = utils.exec('-cbr');
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        expect(launchResult).toContain("build start");
        expect(launchResult).toContain("build ok");
        
        expect(utils.fm.isDirectory(buildRoot)).toBe(true);
        expect(utils.fm.isDirectory(releaseRoot)).toBe(true);
        
        // Check that js merged file is smaller on release than on setup
        let jsBuildFileSize = utils.fm.getFileSize(buildRoot + sep + folderName + '.js');
        let jsReleaseFileSize = utils.fm.getFileSize(releaseRoot + sep + folderName + '.js');
        
        expect(jsBuildFileSize).toBeGreaterThan(0);
        expect(jsReleaseFileSize).toBeGreaterThan(0);
        expect(jsBuildFileSize).toBeGreaterThan(jsReleaseFileSize);
    });
    
    
    it('should include project semver (0.4.0) inside all generated release merged JS on a lib_js git project with created tags', function() {
        
        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");
        
        expect(utils.execCmdCommand('git init')).toContain("Initialized empty Git repository");
        utils.execCmdCommand('git add .');
        utils.execCmdCommand('git commit -m "test commit"');
        utils.execCmdCommand('git tag 0.1.0');
        
        utils.fm.saveFile('.' + sep + 'test.txt');
        utils.execCmdCommand('git add .');
        utils.execCmdCommand('git commit -m "test commit 2"');
        
        utils.execCmdCommand('git tag 0.4.0');
        
        let launchResult = utils.exec('-cr');
        expect(launchResult).toContain("0.4.0");
        
        let mergedContent = utils.fm.readFile(
            '.' + sep + 'target' + sep + folderName + '-0.4.0' + sep + 'dist' + sep + folderName + '.js');
        
        expect(mergedContent.substr(0, 9)).toBe("// 0.4.0\n");
    });
    
    
    it('should replace all wildcard matches with project version on all configured file extensions', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.fm.saveFile('./src/main/t0.php', '<?php // 1 - @@--build-version--@@ 2 - @@--build-version--@@ ?>')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t1.php', '<?php $1 = "@@--build-version--@@"; $2 = "@@--build-version--@@" ?>')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t2.js', 'var a = "@@--build-version--@@"; var b = "@@--build-version--@@";')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t3.json', '{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t4.txt', '{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}')).toBe(true);
        
        let setup = utils.readSetupFile(); 
        setup.build.replaceVersion.enabled = true;
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-r')).toContain('release ok');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t0.php'))
            .toBe('<?php ?>');
    
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t1.php'))
            .toBe('<?php $1 = "0.0.0"; $2 = "0.0.0" ?>');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t2.js'))
            .toBe('var a="0.0.0",b="0.0.0";');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t3.json'))
            .toBe('{ "a": "0.0.0", "b": "0.0.0"}');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
    });
    
    
    it('should NOT replace wildcard matches on configured file extensions when wildcard is set to empty string or enabled is false', function() {
        
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        expect(utils.fm.saveFile('./src/main/t0.php', '<?php // 1 - @@--build-version--@@ 2 - @@--build-version--@@ ?>')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t1.php', '<?php $1 = "@@--build-version--@@"; $2 = "@@--build-version--@@" ?>')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t2.js', 'var a = "@@--build-version--@@"; var b = "@@--build-version--@@";')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t3.json', '{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}')).toBe(true);
        expect(utils.fm.saveFile('./src/main/t4.txt', '{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}')).toBe(true);
        
        // replaceVersion.enabled is false by default, so no replacement must happen
        expect(utils.exec('-r')).toContain('release ok');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t0.php'))
            .toBe('<?php ?>');
    
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t1.php'))
            .toBe('<?php $1 = "@@--build-version--@@"; $2 = "@@--build-version--@@" ?>');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t2.js'))
            .toBe('var a="@@--build-version--@@",b="@@--build-version--@@";');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t3.json'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        // We will now enable replaceversion and set an empty wildcard. No replacement must happen
        let setup = utils.readSetupFile();
        setup.build.replaceVersion.enabled = true;
        setup.build.replaceVersion.wildCard = "";        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-r')).toContain('release ok');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t0.php'))
            .toBe('<?php ?>');
    
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t1.php'))
            .toBe('<?php $1 = "@@--build-version--@@"; $2 = "@@--build-version--@@" ?>');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t2.js'))
            .toBe('var a="@@--build-version--@@",b="@@--build-version--@@";');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t3.json'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        expect(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
    });
    
    
    it('should build correctly when turbosite.release.json is missing', function() {
        
        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
       
        expect(utils.fm.deleteFile('.' + sep + 'turbosite.release.json')).toBe(true);
    
        let launchResult = utils.exec('-r');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        
        let tsSetup = JSON.parse(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/turbosite.json'));

        expect(tsSetup.baseURL).toBe("");
        expect(tsSetup.errorSetup.exceptionsToBrowser).toBe(false);
        expect(tsSetup.errorSetup.exceptionsToMail).toBe("");
        expect(tsSetup.errorSetup.warningsToMail).toBe("");
    }); 
    
    
    it('should override turbosite.json with turbosite.release.jon values on release target folder', function() {
        
        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        let buildRoot = '.' + sep + 'target' + sep + folderName + sep + 'dist' + sep + 'site';
        let releaseRoot = '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'site';
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
       
        let tsRelease = JSON.parse(utils.fm.readFile('.' + sep + 'turbosite.release.json')); 
        tsRelease.baseURL = 'some custom base url';
        tsRelease.errorSetup = {};
        tsRelease.errorSetup.exceptionsToMail = 'mycustommail';
        expect(utils.fm.saveFile('.' + sep + 'turbosite.release.json', JSON.stringify(tsRelease))).toBe(true);
        
        let launchResult = utils.exec('-r');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        
        let tsSetup = JSON.parse(utils.fm.readFile('./target/' + folderName + '-0.0.0/dist/site/turbosite.json'));

        expect(tsSetup.baseURL).toBe("some custom base url");
        expect(tsSetup.errorSetup.exceptionsToBrowser).toBe(false);
        expect(tsSetup.errorSetup.exceptionsToMail).toBe("mycustommail");
        expect(tsSetup.errorSetup.warningsToMail).toBe("");
    });  
});