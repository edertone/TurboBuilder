#!/usr/bin/env node
'use strict';


/**
 * Tests related to the sync feature of the cmd app
 */


const utils = require('../test-utils');


describe('cmd-parameter-sync', function(){

    beforeEach(function(){

        this.workdir = utils.createAndSwitchToTempFolder('test-sync');
    });


    afterEach(function(){

        utils.switchToExecutionDir();

        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });


    it('should fail when -s and --sync arguments are executed on an empty folder', function(){

        expect(utils.exec('-s')).toContain(global.fileNames.setup + ' setup file not found');
        expect(utils.exec('--sync')).toContain(global.fileNames.setup + ' setup file not found');
    });


    it('should fail when -s and --sync arguments are executed on an empty setup file structure', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let setup = utils.readSetupFile();

        setup.build = {};

        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-s')).toContain('No valid project type specified');
        expect(utils.exec('--sync')).toContain('No valid project type specified');
    });


    it('should fail on a generated project that has no target folder', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        expect(utils.exec('-s')).toContain('Source path does not exist:');
        expect(utils.exec('--sync')).toContain('Source path does not exist:');
    });


    it('should not sync (runAfterBuild) by default when a site_php project is generated', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let testsLaunchResult = utils.exec('-b');
        expect(testsLaunchResult).toContain("build start: site_php");
        expect(testsLaunchResult).not.toContain("sync ok to fs");
    });


    it('should sync to another folder when fileSystem sync is enabled', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);

        let setup = utils.readSetupFile();

        setup.sync = {
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-bs')).toContain('sync ok to fs');

        expect(utils.fm.isDirectory(destFolder + utils.fm.dirSep() + 'site')).toBe(true);

        expect(utils.fm.deleteDirectory(destFolder, false)).toBe(true);

        expect(utils.exec('--build --sync')).toContain('sync ok to fs');

        expect(utils.fm.isDirectory(destFolder + utils.fm.dirSep() + 'site')).toBe(true);

        // Sync must fail the second time due to a non empty destination folder
        expect(utils.exec('-s')).toContain('Destination path is not empty');

        // Modify setup to allow delete dest path and try again
        setup.sync.deleteDestPathContents = true;
        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-s')).toContain('sync ok to fs');
        expect(utils.fm.isDirectory(destFolder + utils.fm.dirSep() + 'site')).toBe(true);
    });


    it('should sync automatically to another folder when filesystem sync enabled, runAfterBuild is true and -b is called', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);

        let setup = utils.readSetupFile();

        setup.sync = {
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(utils.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = utils.exec('-b');
        expect(testsLaunchResult).toContain("sync ok to fs");
    });


    it('should not execute filesystem sync two times when runAfterBuild is false and -bs is called via cmd', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);

        let setup = utils.readSetupFile();

        setup.sync = {
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(utils.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = utils.exec('-bs');
        expect(testsLaunchResult).toContain("sync ok to fs");
        expect(testsLaunchResult).toContain("sync start");
        expect(testsLaunchResult.split("sync ok to fs").length - 1).toBe(1);
    });


    it('should not execute filesystem sync two times when runAfterBuild is true and -bs is called via cmd', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);

        let setup = utils.readSetupFile();

        setup.sync = {
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(utils.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = utils.exec('-bs');
        expect(testsLaunchResult).toContain("sync ok to fs");
        expect(testsLaunchResult).not.toContain("sync start");
        expect(testsLaunchResult.split("sync ok to fs").length - 1).toBe(1);
    });


    it('should sync release to another folder when fileSystem sync is enabled', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);

        let setup = utils.readSetupFile();

        // Create a raw file on the dest folder, so we can check that it gets removed after sync due to the
        // deleteDestPathContents being enabled
        expect(utils.fm.saveFile(destFolder + utils.fm.dirSep() + 'some-raw-file-to-be-deleted.txt', 'content')).toBe(true);
        expect(utils.fm.isFile(destFolder + utils.fm.dirSep() + 'some-raw-file-to-be-deleted.txt')).toBe(true);

        setup.sync = {
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : true
        };

        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-rs')).toContain('sync ok to fs');

        expect(utils.fm.isFile(destFolder + utils.fm.dirSep() + 'some-raw-file-to-be-deleted.txt')).toBe(false);
        expect(utils.fm.isDirectory(destFolder + utils.fm.dirSep() + 'site')).toBe(true);

        expect(utils.fm.deleteDirectory(destFolder, false)).toBe(true);

        expect(utils.exec('--release --sync')).toContain('sync ok to fs');

        expect(utils.fm.isDirectory(destFolder + utils.fm.dirSep() + 'site')).toBe(true);
    });


    it('should sync release to another folder when fileSystem sync is enabled and runAfterBuild is true', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);

        let setup = utils.readSetupFile();

        setup.sync = {
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : false
        };

        expect(utils.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = utils.exec('-r');
        expect(testsLaunchResult).toContain("sync ok to fs");
        expect(testsLaunchResult).not.toContain("sync start");
        expect(testsLaunchResult.split("sync ok to fs").length - 1).toBe(1);
    });


    it('should sync release to a folder as overrided by turbobuilder.release.json when filesystem sync is enabled', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder + '-build')).toBe(true);
        expect(utils.fm.createDirectory(destFolder + '-release')).toBe(true);

        let setup = utils.readSetupFile();

        setup.sync = {
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder + '-build',
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : true
        };

        expect(utils.saveToSetupFile(setup)).toBe(true);

        // Create a setup file that overrides the destpath to a different location
        utils.fm.saveFile('.' + utils.fm.dirSep() + global.fileNames.setupRelease, JSON.stringify({
            "sync" : {
                "destPath" : destFolder + '-release'
            }
        }));

        // Verify that release generates the files into the -release folder
        expect(utils.exec('-rs')).toContain('sync ok to fs');

        expect(utils.fm.isDirectoryEmpty(destFolder + '-build')).toBe(true);
        expect(utils.fm.isDirectoryEmpty(destFolder + '-release')).toBe(false);
        expect(utils.fm.isDirectory(destFolder + '-release' + utils.fm.dirSep() + 'site')).toBe(true);
    });
});