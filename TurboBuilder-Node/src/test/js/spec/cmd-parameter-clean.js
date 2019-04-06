#!/usr/bin/env node
'use strict';


/**
 * Tests related to the clean feature of the cmd app
 */


const utils = require('../cmd-parameter-test-utils');
const { StringUtils } = require('turbocommons-ts');


describe('cmd-parameter-clean', function(){

    beforeEach(function(){

        this.workdir = utils.createAndSwitchToTempFolder('test-clean');
    });


    afterEach(function(){

        utils.switchToExecutionDir();

        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });


    it('should correctly clean a lib_ts project', function(){

        let folderName = StringUtils.getPathElement(this.workdir);

        utils.generateProjectAndSetTurbobuilderSetup('lib_ts', null, []);
        
        expect(utils.fm.saveFile('./src/main/ts/index.ts', '')).toBe(true);

        expect(utils.exec('-b')).toContain('build ok');

        expect(utils.fm.isDirectory('./target')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/es5/PackedJsFileName-ES5.js')).toBe(true);

        expect(utils.exec('-c')).toContain("clean ok");

        expect(utils.fm.isDirectory('./target')).toBe(false);
    });


    it('should correctly clean a lib_js project', function(){

        let folderName = StringUtils.getPathElement(this.workdir);

        utils.generateProjectAndSetTurbobuilderSetup('lib_js', null, []);
        
        expect(utils.exec('-b')).toContain('build ok');

        expect(utils.fm.isDirectory('./target')).toBe(true);
        expect(utils.fm.isDirectory('./target/' + folderName + '/dist/js')).toBe(false);
        
        expect(utils.exec('-c')).toContain("clean ok");

        expect(utils.fm.isDirectory('./target')).toBe(false);
    });


    it('should correctly clean a site_php project', function(){

        let folderName = StringUtils.getPathElement(this.workdir);
        
        utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.isDirectory('./target')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/.htaccess')).toBe(true);
        
        expect(utils.exec('-c')).toContain("clean ok");

        expect(utils.fm.isDirectory('./target')).toBe(false);        
    });
    
    
    it('should correctly clean a server_php project', function(){

        let folderName = StringUtils.getPathElement(this.workdir);
        
        utils.generateProjectAndSetTurbobuilderSetup('server_php', null, []);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.isDirectory('./target')).toBe(true);
        expect(utils.fm.isFile('./target/' + folderName + '/dist/.htaccess')).toBe(true);
        
        expect(utils.exec('-c')).toContain("clean ok");

        expect(utils.fm.isDirectory('./target')).toBe(false);        
    });


    it('should correctly clean a filesystem synced site_php and keep the synced folder data when -c is called but delete it if -cs is called', function(){

        let setup = utils.generateProjectAndSetTurbobuilderSetup('site_php', null, []);
        
        let destFolder = this.workdir + utils.fm.dirSep() + 'destinationfolder';

        expect(utils.fm.createDirectory(destFolder)).toBe(true);
        
        setup.sync = {
            "runAfterBuild" : true,
            "type" : "fileSystem",
            "excludes" : [],
            "sourcePath" : "dist/",
            "destPath" : destFolder,
            "remoteUrl" : "http://localhost",
            "deleteDestPathContents" : true
        };

        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-b')).toContain('sync ok to fs');

        expect(utils.fm.isFile(destFolder + utils.fm.dirSep() + 'site' + utils.fm.dirSep() + 'index.php')).toBe(true);
        
        expect(utils.exec('-c')).toContain("clean ok");
        
        expect(utils.fm.isDirectory('./target')).toBe(false);
        expect(utils.fm.isFile(destFolder + utils.fm.dirSep() + 'site' + utils.fm.dirSep() + 'index.php')).toBe(true);

        expect(utils.exec('-b')).toContain('sync ok to fs');

        expect(utils.fm.isDirectory('./target')).toBe(true);
        
        expect(utils.exec('-cs')).toContain("clean ok");
        
        expect(utils.fm.isDirectory('./target')).toBe(false);
        expect(utils.fm.isFile(destFolder + utils.fm.dirSep() + 'site' + utils.fm.dirSep() + 'index.php')).toBe(false);
    });
    
    
    it('should say that cleaning a node cmd application is not necessary', function(){

        utils.generateProjectAndSetTurbobuilderSetup('app_node_cmd', null, []);
        
        expect(utils.exec('-c')).toContain('Clean is not necessary for node cmd apps');   
    });
});