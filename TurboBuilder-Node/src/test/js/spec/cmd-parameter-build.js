#!/usr/bin/env node

'use strict';


/**
 * Tests related to the build feature of the cmd app
 */


require('./../../../main/js/globals');
const utils = require('../test-utils');
const { StringUtils } = require('turbocommons-ts');


describe('cmd-parameter-build', function() {
    
    beforeEach(function() {
        
        this.workdir = utils.createAndSwitchToTempFolder('test-build');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });
    
    it('should fail when -b and --build arguments are executed on an empty folder', function() {

        expect(utils.exec('-b')).toContain(global.fileNames.setup + ' setup file not found');
        expect(utils.exec('--build')).toContain(global.fileNames.setup + ' setup file not found');
    });
    
    
    it('should fail when -b and --build arguments are executed on an empty setup file structure', function() {

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();

        setup.build = {};
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-b')).toContain('Nothing to build. Please enable any of');
        expect(utils.exec('--build')).toContain('Nothing to build. Please enable any of');
    });
    
    
    it('should fail when more than one project type are defined on setup file', function() {
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        setup.build = {lib_ts: {}, lib_php: {}};
        
        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-b')).toContain('Please specify only one of the following on build setup');
        expect(utils.exec('--build')).toContain('Please specify only one of the following on build setup');
    });
    
    
    it('should fail with no files to build when build is executed after enabling ts build with no ts files', function() {
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        setup.build = {lib_ts: {}};
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
      
        // Delete the src ts folder
        expect(utils.fm.deleteDirectory('.' + utils.fm.dirSep() + 'src' + utils.fm.dirSep() + 'main' + utils.fm.dirSep() + 'ts', false)).toBe(true);

        expect(utils.exec('-b')).toContain('no files to build');
        expect(utils.exec('--build')).toContain('no files to build');
    });
    
    
    it('should build correctly when -b argument is passed after generating a lib_ts structure with some ts files', function() {
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
       
        expect(utils.fm.saveFile('./src/main/ts/index.ts', '')).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
        
        expect(utils.fm.isFile('./target/test-build/dist/es5/PackedJsFileName-ES5.js')).toBe(true);
        expect(utils.fm.isFile('./target/test-build/dist/es6/PackedJsFileName-ES6.js')).toBe(true);
        expect(utils.fm.isFile('./target/test-build/dist/ts/index.js')).toBe(true);
    });
    
    
    it('should create phar file when -b argument is executed after generating a lib_php project structure with some php files', function() {
        
        expect(utils.exec('-g lib_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        
        expect(utils.fm.saveFile('./src/main/php/AutoLoader.php', '<?php ?>')).toBe(true);
        
        expect(utils.exec('-b')).toContain('build ok');
  
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.fm.isFile('./target/' + folderName  + '/dist/' + folderName  + '-0.0.0.phar')).toBe(true);
    });
    
    
    it('should build ok when -b argumetn is executed on a generated site_php project', function() {
        
        expect(utils.exec('-g site_php')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
        
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(true);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        
        expect(utils.exec('-b')).toContain('build ok');
    });
});