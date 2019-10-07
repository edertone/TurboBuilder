'use strict';


/**
 * Tests related to the clean feature of the cmd app
 */


const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');


const fm = new FilesManager();
const terminalManager = new TerminalManager();


describe('cmd-parameter-clean', function(){

    beforeEach(function(){

        this.tempDir = terminalManager.createTempDirectory('test-clean');
    });


    afterEach(function(){

        terminalManager.setInitialWorkDir();

        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });


    it('should correctly clean a lib_ts project', function(){

        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());

        testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        expect(fm.saveFile('./src/main/ts/index.ts', '')).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');

        expect(fm.isDirectory('./target')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/es5/PackedJsFileName-ES5.js')).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-c')).toContain("clean ok");

        expect(fm.isDirectory('./target')).toBe(false);
    });


    it('should correctly clean a lib_js project', function(){

        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());

        testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');

        expect(fm.isDirectory('./target')).toBe(true);
        expect(fm.isDirectory('./target/' + folderName + '/dist/js')).toBe(false);
        
        expect(testsGlobalHelper.execTbCmd('-c')).toContain("clean ok");

        expect(fm.isDirectory('./target')).toBe(false);
    });


    it('should correctly clean a site_php project', function(){

        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.isDirectory('./target')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/.htaccess')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-c')).toContain("clean ok");

        expect(fm.isDirectory('./target')).toBe(false);        
    });
    
    
    it('should correctly clean a server_php project', function(){

        let folderName = StringUtils.getPathElement(terminalManager.getWorkDir());
        
        testsGlobalHelper.generateProjectAndSetup('server_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-b')).toContain('build ok');
        
        expect(fm.isDirectory('./target')).toBe(true);
        expect(fm.isFile('./target/' + folderName + '/dist/.htaccess')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-c')).toContain("clean ok");

        expect(fm.isDirectory('./target')).toBe(false);        
    });


    it('should correctly clean a filesystem synced site_php and keep the synced folder data when -c is called but delete it if -cs is called', function(){

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
            "deleteDestPathContents" : true
        };

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-b')).toContain('sync ok to fs');

        expect(fm.isFile(destFolder + fm.dirSep() + 'site' + fm.dirSep() + 'index.php')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-c')).toContain("clean ok");
        
        expect(fm.isDirectory('./target')).toBe(false);
        expect(fm.isFile(destFolder + fm.dirSep() + 'site' + fm.dirSep() + 'index.php')).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-b')).toContain('sync ok to fs');

        expect(fm.isDirectory('./target')).toBe(true);
        
        expect(testsGlobalHelper.execTbCmd('-cs')).toContain("clean ok");
        
        expect(fm.isDirectory('./target')).toBe(false);
        expect(fm.isFile(destFolder + fm.dirSep() + 'site' + fm.dirSep() + 'index.php')).toBe(false);
    });
    
    
    it('should correctly clean a node cmd application', function(){

        testsGlobalHelper.generateProjectAndSetup('app_node_cmd', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-c')).toContain('clean ok');   
    });
});