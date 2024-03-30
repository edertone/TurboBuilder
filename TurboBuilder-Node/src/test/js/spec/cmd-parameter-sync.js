'use strict';


/**
 * Tests related to the sync feature of the cmd app
 */


require('./../../../main/js/globals');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');


const fm = new FilesManager();
const terminalManager = new TerminalManager();


describe('cmd-parameter-sync', function(){

    beforeEach(function(){

        this.tempDir = terminalManager.createTempDirectory('test-sync');
    });


    afterEach(function(){

        terminalManager.setInitialWorkDir();

        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });


    it('should fail when -s and --sync arguments are executed on an empty folder', function(){

        expect(testsGlobalHelper.execTbCmd('-s')).toContain(global.fileNames.setup + ' setup file not found');
        expect(testsGlobalHelper.execTbCmd('--sync')).toContain(global.fileNames.setup + ' setup file not found');
    });


    it('should fail when -s and --sync arguments are executed on an empty setup file build structure', function(){

        testsGlobalHelper.generateProjectAndSetup('site_php', {}, []);

        // These regexps make sure that the last message from the exec result is the expected error and nothing more comes after
        expect(testsGlobalHelper.execTbCmd('-s')).toMatch(/^[\s\S]*No valid project type specified.*under build section in turbobuilder.json[\s\S]*$/);
        expect(testsGlobalHelper.execTbCmd('--sync')).toMatch(/^[\s\S]*No valid project type specified.*under build section in turbobuilder.json[\s\S]*$/);
    });


    it('should fail on a generated project that has no target folder', function(){

        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);

        expect(testsGlobalHelper.execTbCmd('-s')).toContain('Source path does not exist:');
        expect(testsGlobalHelper.execTbCmd('--sync')).toContain('Source path does not exist:');
    });


    it('should not sync (runAfterBuild) by default when a site_php project is generated', function(){

        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);

        let testsLaunchResult = testsGlobalHelper.execTbCmd('-b');
        expect(testsLaunchResult).toContain("build start: site_php");
        expect(testsLaunchResult).not.toContain("sync ok to fs");
    });


    it('should sync to another folder when fileSystem sync is enabled', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let destFolder = terminalManager.getWorkDir() + fm.dirSep() + 'destinationfolder';

        expect(fm.createDirectory(destFolder)).toBe(true);

        setup.sync = {
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-bs')).toContain('sync ok to fs');

        expect(fm.isDirectory(destFolder + fm.dirSep() + 'site')).toBe(true);

        expect(fm.deleteDirectory(destFolder, false)).toBeGreaterThan(-1);

        expect(testsGlobalHelper.execTbCmd('--build --sync')).toContain('sync ok to fs');

        expect(fm.isDirectory(destFolder + fm.dirSep() + 'site')).toBe(true);

        // Sync must fail the second time due to a non empty destination folder
        expect(testsGlobalHelper.execTbCmd('-s')).toContain('Destination path is not empty');

        // Modify setup to allow delete dest path and try again
        setup.sync.deleteDestPathContents = true;
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-s')).toContain('sync ok to fs');
        expect(fm.isDirectory(destFolder + fm.dirSep() + 'site')).toBe(true);
    });


    it('should sync automatically to another folder when filesystem sync enabled, runAfterBuild is true and -b is called', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);

        let destFolder = terminalManager.getWorkDir() + fm.dirSep() + 'destinationfolder';

        expect(fm.createDirectory(destFolder)).toBe(true);

        setup.sync = {
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = testsGlobalHelper.execTbCmd('-b');
        expect(testsLaunchResult).toContain("sync ok to fs");
    });


    it('should not execute filesystem sync two times when runAfterBuild is false and -bs is called via cmd', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);

        let destFolder = terminalManager.getWorkDir() + fm.dirSep() + 'destinationfolder';

        expect(fm.createDirectory(destFolder)).toBe(true);

        setup.sync = {
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = testsGlobalHelper.execTbCmd('-bs');
        expect(testsLaunchResult).toContain("sync ok to fs");
        expect(testsLaunchResult).toContain("sync start");
        expect(testsLaunchResult.split("sync ok to fs").length - 1).toBe(1);
    });


    it('should not execute filesystem sync two times when runAfterBuild is true and -bs is called via cmd', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);

        let destFolder = terminalManager.getWorkDir() + fm.dirSep() + 'destinationfolder';

        expect(fm.createDirectory(destFolder)).toBe(true);

        setup.sync = {
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = testsGlobalHelper.execTbCmd('-bs');
        expect(testsLaunchResult).toContain("sync ok to fs");
        expect(testsLaunchResult).not.toContain("sync start");
        expect(testsLaunchResult.split("sync ok to fs").length - 1).toBe(1);
    });


    it('should sync release to another folder when fileSystem sync is enabled', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);

        let destFolder = terminalManager.getWorkDir() + fm.dirSep() + 'destinationfolder';

        expect(fm.createDirectory(destFolder)).toBe(true);

        // Create a raw file on the dest folder, so we can check that it gets removed after sync due to the
        // deleteDestPathContents being enabled
        expect(fm.saveFile(destFolder + fm.dirSep() + 'some-raw-file-to-be-deleted.txt', 'content')).toBe(true);
        expect(fm.isFile(destFolder + fm.dirSep() + 'some-raw-file-to-be-deleted.txt')).toBe(true);

        setup.sync = {
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : true
        };

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-rs')).toContain('sync ok to fs');

        expect(fm.isFile(destFolder + fm.dirSep() + 'some-raw-file-to-be-deleted.txt')).toBe(false);
        expect(fm.isDirectory(destFolder + fm.dirSep() + 'site')).toBe(true);

        expect(fm.deleteDirectory(destFolder, false)).toBeGreaterThan(-1);

        expect(testsGlobalHelper.execTbCmd('--release --sync')).toContain('sync ok to fs');

        expect(fm.isDirectory(destFolder + fm.dirSep() + 'site')).toBe(true);
    });


    it('should sync release to another folder when fileSystem sync is enabled and runAfterBuild is true', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let destFolder = terminalManager.getWorkDir() + fm.dirSep() + 'destinationfolder';

        expect(fm.createDirectory(destFolder)).toBe(true);

        setup.sync = {
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = testsGlobalHelper.execTbCmd('-r');
        expect(testsLaunchResult).toContain("sync ok to fs");
        expect(testsLaunchResult).not.toContain("sync start");
        expect(testsLaunchResult.split("sync ok to fs").length - 1).toBe(1);
    });


    it('should sync release to a folder as overrided by turbobuilder.release.json when filesystem sync is enabled', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let destFolder = terminalManager.getWorkDir() + fm.dirSep() + 'destinationfolder';

        expect(fm.createDirectory(destFolder + '-build')).toBe(true);
        expect(fm.createDirectory(destFolder + '-release')).toBe(true);

        setup.sync = {
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder + '-build',
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : true
        };

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        // Create a setup file that overrides the destpath to a different location
        fm.saveFile('.' + fm.dirSep() + global.fileNames.setupRelease, JSON.stringify({
            "sync" : {
                "destPath" : destFolder + '-release'
            }
        }));

        // Verify that release generates the files into the -release folder
        expect(testsGlobalHelper.execTbCmd('-rs')).toContain('sync ok to fs');

        expect(fm.isDirectoryEmpty(destFolder + '-build')).toBe(true);
        expect(fm.isDirectoryEmpty(destFolder + '-release')).toBe(false);
        expect(fm.isDirectory(destFolder + '-release' + fm.dirSep() + 'site')).toBe(true);
    });
    
    
    it('should not fail and not sync anything if sync is called but no sync setup is defined', function(){
        
        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        delete setup.sync;
        delete setup.test;

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let launchResult = testsGlobalHelper.execTbCmd('-cbts');
        expect(launchResult).toContain('build ok');
        expect(launchResult.toLowerCase()).not.toContain('error');
        expect(launchResult.toLowerCase()).not.toContain('could not find jasmine config file');
    });
});