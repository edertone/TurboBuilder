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

        setup.sync = [{
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourceRoot" : "build",
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "deleteDestPathContents" : false
        }];

        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-bs')).toContain('sync ok to fs');

        expect(utils.fm.isDirectory(destFolder + utils.fm.dirSep() + 'site')).toBe(true);

        expect(utils.fm.deleteDirectory(destFolder, false)).toBe(true);

        expect(utils.exec('--build --sync')).toContain('sync ok to fs');

        expect(utils.fm.isDirectory(destFolder + utils.fm.dirSep() + 'site')).toBe(true);

        // Sync must fail the second time due to a non empty destination folder
        expect(utils.exec('-s')).toContain('Destination path is not empty');

        // Modify setup to allow delete dest path and try again
        setup.sync[0].deleteDestPathContents = true;
        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-s')).toContain('sync ok to fs');
        expect(utils.fm.isDirectory(destFolder + utils.fm.dirSep() + 'site')).toBe(true);
    });


    it('should sync automatically to another folder when filesystem sync enabled, runAfterBuild is true and -b is called', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);

        let setup = utils.readSetupFile();

        setup.sync = [{
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourceRoot" : "build",
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "deleteDestPathContents" : false
        }];

        expect(utils.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = utils.exec('-b');
        expect(testsLaunchResult).toContain("sync ok to fs");
    });


    it('should not execute filesystem sync two times when runAfterBuild is false and -bs is called via cmd', function(){

        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");

        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);

        let setup = utils.readSetupFile();

        setup.sync = [{
            "runAfterBuild" : false,
            "type" : "fileSystem",
            "excludes" : [],
            "sourceRoot" : "build",
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "deleteDestPathContents" : false
        }];

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

        setup.sync = [{
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourceRoot" : "build",
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "deleteDestPathContents" : false
        }];

        expect(utils.saveToSetupFile(setup)).toBe(true);

        let testsLaunchResult = utils.exec('-bs');
        expect(testsLaunchResult).toContain("sync ok to fs");
        expect(testsLaunchResult).not.toContain("sync start");
        expect(testsLaunchResult.split("sync ok to fs").length - 1).toBe(1);
    });
});