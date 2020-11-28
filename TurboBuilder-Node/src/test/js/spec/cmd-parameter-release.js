'use strict';


/**
 * Tests related to the release feature of the cmd app
 */


require('./../../../main/js/globals');
const { ObjectUtils, StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { TurboSiteTestsManager } = require('turbotesting-node');
const { TerminalManager } = require('turbodepot-node');

const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');
const terminalManager = new TerminalManager();


describe('cmd-parameter-release', function() {
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-release');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });
    
    
    it('should include project semver (0.0.0) inside all generated release merged JS on a non git project', function() {

        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        let launchResult = testsGlobalHelper.execTbCmd('-cr');        
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("changelog failed");
        expect(launchResult).toContain("release ok");
        expect(launchResult).toContain("0.0.0");
        
        let mergedContent = fm.readFile(
            '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'es5' + sep + 'PackedJsFileName-ES5.js');
        
        expect(mergedContent.substr(0, 9)).toBe("// 0.0.0\n");
        
        mergedContent = fm.readFile(
                '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'es6' + sep + 'PackedJsFileName-ES6.js');
            
        expect(mergedContent.substr(0, 9)).toBe("// 0.0.0\n");
    });
    
    
    it('should include project semver (0.4.0) inside all generated release merged JS on a lib_ts git project with created tags', function() {

        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        expect(terminalManager.exec('git init').output).toContain("Initialized empty Git repository");
        terminalManager.exec('git add .');
        terminalManager.exec('git commit -m "test commit"');
        terminalManager.exec('git tag 0.1.0');
        
        fm.saveFile('.' + sep + 'test.txt');
        terminalManager.exec('git add .');
        terminalManager.exec('git commit -m "test commit 2"');
        
        terminalManager.exec('git tag 0.4.0');
        
        let launchResult = testsGlobalHelper.execTbCmd('-cr');        
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        expect(launchResult).toContain("0.4.0");
        
        let mergedContent = fm.readFile(
            '.' + sep + 'target' + sep + folderName + '-0.4.0' + sep + 'dist' + sep + 'es5' + sep + 'PackedJsFileName-ES5.js');
        
        expect(mergedContent.substr(0, 9)).toBe("// 0.4.0\n");
        
        mergedContent = fm.readFile(
                '.' + sep + 'target' + sep + folderName + '-0.4.0' + sep + 'dist' + sep + 'es6' + sep + 'PackedJsFileName-ES6.js');
            
        expect(mergedContent.substr(0, 9)).toBe("// 0.4.0\n");
    });
    
    
    it('should correctly generate release minifications for a site_php generated project', function() {
        
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let projectResourcesRoot = '.' + sep + 'src' + sep + 'main' + sep + 'resources';
        let buildRoot = '.' + sep + 'target' + sep + folderName + sep + 'dist' + sep + 'site';
        let releaseRoot = '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'site';
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        // Copy a non optimized jpg image to the src/main/resources folder
        fm.createDirectory(projectResourcesRoot + sep + 'pics');
        
        fm.copyFile(global.installationPaths.testResources + sep + 'cmd-parameter-release' + sep + 'non-optimized-jpg-image.jpg',
            projectResourcesRoot + sep + 'non-optimized-jpg-image.jpg');
        
        // First launch the build
        let launchResult = testsGlobalHelper.execTbCmd('-cb');
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("build start");
        expect(launchResult).toContain("build ok");
        
        // Next launch the release
        launchResult = testsGlobalHelper.execTbCmd('-r');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        
        expect(fm.isDirectory(buildRoot)).toBe(true);
        expect(fm.isDirectory(releaseRoot)).toBe(true);
        
        let buildSetup = tsm.getSetupFromIndexPhp('turbosite', buildRoot + sep + 'index.php');
        let releaseSetup = tsm.getSetupFromIndexPhp('turbosite', releaseRoot + sep + 'index.php');
        
        // Check that js files are smaller on release than on build
        let jsBuildFileSize = fm.getFileSize(buildRoot + sep + 'glob-' + buildSetup.cacheHash + '.js');
        let jsReleaseFileSize = fm.getFileSize(releaseRoot + sep + 'glob-' + releaseSetup.cacheHash + '.js');
        
        expect(jsBuildFileSize).toBeGreaterThan(0);
        expect(jsReleaseFileSize).toBeGreaterThan(0);
        expect(jsBuildFileSize).toBeGreaterThan(jsReleaseFileSize);
    
        // Check that css files are smaller on release than on build
        let cssBuildFileSize = fm.getFileSize(buildRoot + sep + 'glob-' + buildSetup.cacheHash + '.css');
        let cssReleaseFileSize = fm.getFileSize(releaseRoot + sep + 'glob-' + releaseSetup.cacheHash + '.css');
        
        expect(cssBuildFileSize).toBeGreaterThan(0);
        expect(cssReleaseFileSize).toBeGreaterThan(0);
        expect(cssBuildFileSize).toBeGreaterThan(cssReleaseFileSize);
    
        // Test that php files are smaller on release than on build
        let phpBuildFileSize = fm.getFileSize(buildRoot + sep + 'index.php');
        let phpReleaseFileSize = fm.getFileSize(releaseRoot + sep + 'index.php');
        
        expect(phpBuildFileSize).toBeGreaterThan(0);
        expect(phpReleaseFileSize).toBeGreaterThan(0);
        expect(phpBuildFileSize).toBeGreaterThan(phpReleaseFileSize);
        
        // Test that htaccess file is smaller on release than on build
        let htaccessBuildFileSize = fm.getFileSize(buildRoot + sep + '..' + sep + '.htaccess');
        let htaccessReleaseFileSize = fm.getFileSize(releaseRoot + sep + '..' + sep + '.htaccess');
        
        expect(htaccessBuildFileSize).toBeGreaterThan(0);
        expect(htaccessReleaseFileSize).toBeGreaterThan(0);
        expect(htaccessBuildFileSize).toBeGreaterThan(htaccessReleaseFileSize);

        // Check that apple touch icon size is smaller on release compilation
        let imgBuildFileSize = fm.getFileSize(buildRoot + sep + 'apple-touch-icon.png');
        let imgReleaseFileSize = fm.getFileSize(releaseRoot + sep + 'apple-touch-icon.png');
        
        expect(imgBuildFileSize).toBeGreaterThan(0);
        expect(imgReleaseFileSize).toBeGreaterThan(0);
        expect(imgBuildFileSize * 0.7).toBeGreaterThan(imgReleaseFileSize);
        
        // We must also test that jpg files are reduced in size
        expect(fm.isFile(projectResourcesRoot + sep + 'non-optimized-jpg-image.jpg')).toBe(true);
        expect(fm.isFile(releaseRoot + sep + 'resources' + sep + 'non-optimized-jpg-image.jpg')).toBe(true);
        
        imgBuildFileSize = fm.getFileSize(buildRoot + sep + 'resources' + sep + 'non-optimized-jpg-image.jpg');
        imgReleaseFileSize = fm.getFileSize(releaseRoot + sep + 'resources' + sep + 'non-optimized-jpg-image.jpg');
        
        expect(imgBuildFileSize).toBeGreaterThan(0);
        expect(imgReleaseFileSize).toBeGreaterThan(0);
        expect(imgBuildFileSize * 0.97).toBeGreaterThan(imgReleaseFileSize);      
    });
    
    
    it('should correctly create the release version for a newly generated server_php project', function() {
        
        testsGlobalHelper.generateProjectAndSetup('server_php', null, []);
        
        let launchResult = testsGlobalHelper.execTbCmd('-cr');
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("minify Js ok");
        expect(launchResult).toContain("minify .htaccess ok");
        expect(launchResult).toContain("minify html ok");
        expect(launchResult).toContain("release ok (");
    });
    
    
    it('should correctly generate release for a lib_js project type when deleteNonMergedJs and deleteNonMergedJs are false', function() {
        
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let releaseRoot = '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist';
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        setup.build.lib_js.deleteNonMergedJs = false;
        setup.build.lib_js.createMergedFile = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
                
        let launchResult = testsGlobalHelper.execTbCmd('-cr');
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release ok");
     
        expect(fm.isDirectory(releaseRoot)).toBe(true);
        expect(fm.isFile(releaseRoot + sep + folderName + '.js')).toBe(false);
        expect(fm.isDirectory(releaseRoot + '/resources')).toBe(true);
        expect(fm.isDirectory(releaseRoot + '/js')).toBe(true);
        expect(fm.isFile(releaseRoot + '/index.js')).toBe(true);
        expect(fm.isFile(releaseRoot + '/js/managers/MyInstantiableClass.js')).toBe(true);
        expect(fm.isFile(releaseRoot + '/js/utils/MyStaticClass.js')).toBe(true);
    });
    
    
    it('should correctly generate release minifications for a lib_js generated project', function() {
        
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        let buildRoot = '.' + sep + 'target' + sep + folderName + sep + 'dist';
        let releaseRoot = '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist';
        
        testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        // First launch the build
        let launchResult = testsGlobalHelper.execTbCmd('-cb');
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("build start");
        expect(launchResult).toContain("build ok");
        
        // Next launch the release
        launchResult = testsGlobalHelper.execTbCmd('-r');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        
        expect(fm.isDirectory(buildRoot)).toBe(true);
        expect(fm.isDirectory(releaseRoot)).toBe(true);
        
        // Check that js merged file is smaller on release than on setup
        let jsBuildFileSize = fm.getFileSize(buildRoot + sep + folderName + '.js');
        let jsReleaseFileSize = fm.getFileSize(releaseRoot + sep + folderName + '.js');
        
        expect(jsBuildFileSize).toBeGreaterThan(0);
        expect(jsReleaseFileSize).toBeGreaterThan(0);
        expect(jsBuildFileSize).toBeGreaterThan(jsReleaseFileSize);
    });
    
    
    it('should release ok when -r argument is executed on a generated app_node_cmd project', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('app_node_cmd', null, []);
        
        expect(ObjectUtils.getKeys(setup.release).length).toBe(0);
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('server_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.build.hasOwnProperty('app_node_cmd')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-r')).toContain('release ok (no files affected or created)');
    });
    
    
    it('should include project semver (0.4.0) inside all generated release merged JS on a lib_js git project with created tags', function() {
        
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        expect(terminalManager.exec('git init').output).toContain("Initialized empty Git repository");
        terminalManager.exec('git add .');
        terminalManager.exec('git commit -m "test commit"');
        terminalManager.exec('git tag 0.1.0');
        
        fm.saveFile('.' + sep + 'test.txt');
        terminalManager.exec('git add .');
        terminalManager.exec('git commit -m "test commit 2"');
        
        terminalManager.exec('git tag 0.4.0');
        
        let launchResult = testsGlobalHelper.execTbCmd('-cr');
        expect(launchResult).toContain("0.4.0");
        
        let mergedContent = fm.readFile(
            '.' + sep + 'target' + sep + folderName + '-0.4.0' + sep + 'dist' + sep + folderName + '.js');
        
        expect(mergedContent.substr(0, 9)).toBe("// 0.4.0\n");
    });
    
    
    it('should replace all wildcard matches with project version on the configured file extensions', function() {
        
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
        
        expect(testsGlobalHelper.execTbCmd('-r')).toContain('release ok');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t0.php'))
            .toBe('<?php ?>');
    
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t1.php'))
            .toBe('<?php $1 = "0.0.0"; $2 = "0.0.0" ?>');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t2.js'))
            .toBe('"use strict";var a="0.0.0",b="0.0.0";');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t3.json'))
            .toBe('{ "a": "0.0.0", "b": "0.0.0"}');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
    });
    
    
    it('should NOT replace wildcard matches on configured file extensions when wildcard is set to empty string or enabled is false', function() {
        
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.validate.php.namespaces.enabled = false;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        testsGlobalHelper.generateSitePhpFilesWithWildcard('@@--build-version--@@');
        
        // versionWildCard.enabled is false by default, so no replacement must happen
        expect(testsGlobalHelper.execTbCmd('-r')).toContain('release ok');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t0.php'))
            .toBe('<?php ?>');
    
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t1.php'))
            .toBe('<?php $1 = "@@--build-version--@@"; $2 = "@@--build-version--@@" ?>');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t2.js'))
            .toBe('"use strict";var a="@@--build-version--@@",b="@@--build-version--@@";');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t3.json'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t4.txt'))
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
        
        expect(testsGlobalHelper.execTbCmd('-r')).toContain('release ok');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t0.php'))
            .toBe('<?php ?>');
    
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t1.php'))
            .toBe('<?php $1 = "@@--build-version--@@"; $2 = "@@--build-version--@@" ?>');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t2.js'))
            .toBe('"use strict";var a="@@--build-version--@@",b="@@--build-version--@@";');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t3.json'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
        
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t4.txt'))
            .toBe('{ "a": "@@--build-version--@@", "b": "@@--build-version--@@"}');
    });
    
    
    it('should build release correctly when turbosite.release.json is missing', function() {
        
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let launchResult = testsGlobalHelper.execTbCmd('-r');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        
        expect(fm.deleteFile('.' + sep + 'turbosite.release.json')).toBe(true);
    
        launchResult = testsGlobalHelper.execTbCmd('-cr');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("Exceptions or warnings are enabled to be shown on browser. This is a security problem. Please disable them");
        
        let tsSetup = JSON.parse(fm.readFile('.' + sep + 'turbosite.json')); 
        tsSetup.errorSetup.exceptionsToBrowser = false;
        tsSetup.errorSetup.warningsToBrowser = false;
        expect(fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(tsSetup))).toBe(true);
                
        launchResult = testsGlobalHelper.execTbCmd('-cr');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        
        tsSetup = tsm.getSetupFromIndexPhp('turbosite', './target/' + folderName + '-0.0.0/dist/site/index.php');

        expect(tsSetup.baseURL).toBe("_dev");
        expect(tsSetup.errorSetup.exceptionsToBrowser).toBe(false);
        expect(tsSetup.errorSetup.exceptionsToMail).toBe("");
        expect(tsSetup.errorSetup.warningsToMail).toBe("");
    });
    
    
    it('should override turbosite.json with turbosite.release.json values on site_php release target folder', function() {
        
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
         
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tsRelease = JSON.parse(fm.readFile('.' + sep + 'turbosite.release.json')); 
        tsRelease.baseURL = 'some custom base url';
        tsRelease.errorSetup = {};
        tsRelease.errorSetup.exceptionsToBrowser = true;
        tsRelease.errorSetup.exceptionsToMail = 'mycustommail';
        expect(fm.saveFile('.' + sep + 'turbosite.release.json', JSON.stringify(tsRelease))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        let launchResult = testsGlobalHelper.execTbCmd('-r');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("Exceptions or warnings are enabled to be shown on browser. This is a security problem. Please disable them");
        
        expect(fm.isDirectoryEmpty('./target/' + folderName + '-0.0.0')).toBe(true);
        
        tsRelease.errorSetup.exceptionsToBrowser = false;
        tsRelease.errorSetup.warningsToBrowser = false;
        expect(fm.saveFile('.' + sep + 'turbosite.release.json', JSON.stringify(tsRelease))).toBe(true);
        
        launchResult = testsGlobalHelper.execTbCmd('-cr');
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        
        let tsSetup = tsm.getSetupFromIndexPhp('turbosite', './target/' + folderName + '-0.0.0/dist/site/index.php');
        
        expect(tsSetup.baseURL).toBe("some custom base url");
        expect(tsSetup.errorSetup.exceptionsToBrowser).toBe(false);
        expect(tsSetup.errorSetup.exceptionsToLog).toBe("");
        expect(tsSetup.errorSetup.exceptionsToMail).toBe("mycustommail");
        expect(tsSetup.errorSetup.warningsToBrowser).toBe(false);
        expect(tsSetup.errorSetup.warningsToLog).toBe("");
        expect(tsSetup.errorSetup.warningsToMail).toBe("");
        expect(tsSetup.errorSetup.tooMuchTimeWarning).toBe(1000);
        expect(tsSetup.errorSetup.tooMuchMemoryWarning).toBe(5000000);
    });
    
    
    it('should override turbodepot.json with turbodepot.release.json values on site_php release target folder', function() {
    
        let sep = fm.dirSep();
        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
         
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tdToOverride = {
            "sources": {
                "mariadb": [
                    {
                        "name": "overriden_name",
                        "host": "overriden_host",
                        "database": "overriden_database",
                        "user": "overriden_user",
                        "password": "overriden_password"
                    }
                ] 
            }
        };
        
        expect(fm.saveFile('.' + sep + 'turbodepot.release.json', JSON.stringify(tdToOverride))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        let tdSetup = tsm.getSetupFromIndexPhp('turbodepot', './target/' + folderName + '/dist/site/index.php');

        expect(tdSetup.sources.fileSystem[0].name).toBe("fs_source_1");
        expect(tdSetup.sources.fileSystem[0].path).toBe("");
        expect(tdSetup.sources.mariadb[0].name).toBe("mariadb_source_1");
        expect(tdSetup.sources.mariadb[0].host).toBe("");
        expect(tdSetup.sources.mariadb[0].database).toBe("");
        expect(tdSetup.sources.mariadb[0].user).toBe("");
        expect(tdSetup.sources.mariadb[0].password).toBe("");
        
        let launchResult = testsGlobalHelper.execTbCmd('-r');
        expect(launchResult).toContain("release ok");
         
        let tdReleaseSetup = tsm.getSetupFromIndexPhp('turbodepot', './target/' + folderName + '-0.0.0/dist/site/index.php');

        expect(tdSetup.sources.fileSystem[0].name).toBe("fs_source_1");
        expect(tdSetup.sources.fileSystem[0].path).toBe("");
        expect(tdReleaseSetup.sources.mariadb[0].name).toBe("overriden_name");
        expect(tdReleaseSetup.sources.mariadb[0].host).toBe("overriden_host");
        expect(tdReleaseSetup.sources.mariadb[0].database).toBe("overriden_database");
        expect(tdReleaseSetup.sources.mariadb[0].user).toBe("overriden_user");
        expect(tdReleaseSetup.sources.mariadb[0].password).toBe("overriden_password");
    });
    
    
    it('should replace wildcards with their RELEASE value on the turbobuilder.json setup when a release is performed', function() {
    
        // The turbobuilder.json file allows to define wildcards to be replaced on the setup itself with different values when build or release is executed.
        // This test checks that this works ok
        
        // TODO - This test is a bit more complex so we leave it pending 
    });
    
    
    it('should replace wildcards with their RELEASE value on the turbodepot.json setup when a release is performed', function() {
    
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
            }]
        };
        expect(fm.saveFile('.' + sep + 'turbobuilder.json', JSON.stringify(setup))).toBe(true);
        
        let tdSetup = JSON.parse(fm.readFile('.' + sep + 'turbodepot.json'));
        
        tdSetup.depots[0].name = "$somewildcard";
        tdSetup.sources.fileSystem[0].name = "$somewildcard";
        
        expect(fm.saveFile('.' + sep + 'turbodepot.json', JSON.stringify(tdSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-r')).toContain("release ok");
        
        let indexPhpSetup = tsm.getSetupFromIndexPhp('turbodepot', './target/' + folderName + '-0.0.0/dist/site/index.php');

        expect(indexPhpSetup.depots[0].name).toBe("wildcard-release-value");
        expect(indexPhpSetup.sources.fileSystem[0].name).toBe("wildcard-release-value");
        expect(indexPhpSetup.hasOwnProperty('wildCards')).toBe(false);  
    });
    
    
    it('should replace code wildcards with their RELEASE value on the code for the specified files when a release is performed', function() {
    
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
        
        let execResult = testsGlobalHelper.execTbCmd('-r');       
        
        expect(execResult).toContain("replaced code wildcards on 4 files");
        expect(execResult).toContain("release ok");

        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t0.php')).toBe('<?php ?>');
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t1.php')).toBe('<?php $1 = "wildcard-release-value"; $2 = "wildcard-release-value" ?>');
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t2.js')).toBe('"use strict";var a="wildcard-release-value",b="wildcard-release-value";');
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t3.json')).toBe('{ "a": "wildcard-release-value", "b": "wildcard-release-value"}');
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t4.txt')).toBe('{ "a": "$somewildcard", "b": "$somewildcard"}');
    });
    
    
    it('should NOT replace code wildcards with their RELEASE value on the code for the specified files when a release is performed and code wildcard is disabled', function() {
    
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
                       
        let execResult = testsGlobalHelper.execTbCmd('-r');       
        
        expect(execResult).toContain("replaced code wildcards on 0 files");
        expect(execResult).toContain("release ok");

        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t0.php')).toBe('<?php ?>');
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t1.php')).toBe('<?php $1 = "$somewildcard"; $2 = "$somewildcard" ?>');
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t2.js')).toBe('"use strict";var a="$somewildcard",b="$somewildcard";');
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t3.json')).toBe('{ "a": "$somewildcard", "b": "$somewildcard"}');
        expect(fm.readFile('./target/' + folderName + '-0.0.0/dist/site/t4.txt')).toBe('{ "a": "$somewildcard", "b": "$somewildcard"}');
    });
    
    
    it('should show errors on turbobuilder.json file when wildcards section is not correctly defined', function() {
    
        let sep = fm.dirSep();
        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);

        // Add an incomplete wildcards property to the json, so error must happen
        setup.wildCards = {
            "setupWildCards": [{
                "enabled": true
            }]
        };
        expect(fm.saveFile('.' + sep + 'turbobuilder.json', JSON.stringify(setup))).toBe(true);        
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/.*wildCards.setupWildCards.* requires property "wildCard"/);
        
        // Add more properties but still missing the releaseValue property which is mandatory
        setup.wildCards = {
            "setupWildCards": [{
                "enabled": true,
                "wildCard": "$somewildcard",
                "buildValue": "wildcard-build-value"
            }]
        };
        expect(fm.saveFile('.' + sep + 'turbobuilder.json', JSON.stringify(setup))).toBe(true);
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/.*wildCards.setupWildCards.* requires property "releaseValue"/);
        
        // Corrupt the json file to make sure the corrupted file error raises
        expect(fm.saveFile('.' + sep + 'turbobuilder.json',
            StringUtils.replace(fm.readFile('.' + sep + 'turbobuilder.json'), '"wildCards":', '"wildCards"'))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toMatch(/Corrupted JSON for .*turbobuilder.json[\s\S]*SyntaxError: Unexpected token/);
    });
    
    
    it('should not allow wildcards section on turbosite.json file', function() {
        
        let sep = fm.dirSep();
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tsSetup = JSON.parse(fm.readFile('.' + sep + 'turbosite.json'));

        tsSetup.wildCards = {
            "setupWildCards": [{
                "enabled": true
            }]
        };
        expect(fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(tsSetup))).toBe(true);        
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/Invalid JSON schema for turbosite.json[\s\S]*instance is not allowed to have the additional property "wildCards"/);
    });    
    
    
    it('should not allow wildcards section on turbodepot.json file', function() {
        
        let sep = fm.dirSep();
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let tsSetup = JSON.parse(fm.readFile('.' + sep + 'turbodepot.json'));

        tsSetup.wildCards = {
            "setupWildCards": [{
                "enabled": true
            }]
        };
        expect(fm.saveFile('.' + sep + 'turbodepot.json', JSON.stringify(tsSetup))).toBe(true);        
        expect(testsGlobalHelper.execTbCmd('-b')).toMatch(/Invalid JSON schema for turbodepot.json[\s\S]*instance is not allowed to have the additional property "wildCards"/);
    }); 
    
    
    it('should replace setup wildcards with their RELEASE value on the turbosite.json when a release is performed', function() {
    
        // The turbobuilder.json file allows to define wildcards to be replaced on the setup with different values when build or release is executed.
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
            }]
        };
        expect(fm.saveFile('.' + sep + 'turbobuilder.json', JSON.stringify(setup))).toBe(true);
        
        let tsSetup = JSON.parse(fm.readFile('.' + sep + 'turbosite.json'));
        tsSetup.baseURL = "$somewildcard";
        tsSetup.locales[0] = "$somewildcard";
        expect(fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(tsSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-r')).toContain("release ok");
        
        let indexPhpSetup = tsm.getSetupFromIndexPhp('turbosite', './target/' + folderName + '-0.0.0/dist/site/index.php');

        // Note that baseUrl is empty cause it gets overriden by turbosite.release.json
        expect(indexPhpSetup.baseURL).toBe("");
        expect(indexPhpSetup.locales[0]).toBe("wildcard-release-value");
        expect(indexPhpSetup.hasOwnProperty('wildCards')).toBe(false);
        
        // The turbosite.release.json file is overriding the baseUrl value, so we will delete it to see that it was correctly replaced
        expect(fm.deleteFile('.' + sep + 'turbosite.release.json')).toBe(true);
        
        tsSetup.errorSetup.exceptionsToBrowser = false;
        tsSetup.errorSetup.warningsToBrowser = false;
        expect(fm.saveFile('.' + sep + 'turbosite.json', JSON.stringify(tsSetup))).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-r')).toContain("release ok");
        
        indexPhpSetup = tsm.getSetupFromIndexPhp('turbosite', './target/' + folderName + '-0.0.0/dist/site/index.php');

        expect(indexPhpSetup.baseURL).toBe("wildcard-release-value");
        expect(indexPhpSetup.locales[0]).toBe("wildcard-release-value");  
        expect(indexPhpSetup.hasOwnProperty('wildCards')).toBe(false);   
    });     
});