#!/usr/bin/env node

'use strict';


/**
 * Tests related to the version feature of the cmd app
 */


require('./../../../main/js/globals');
const setupModule = require('./../../../main/js/setup');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');


const fm = new FilesManager();
const terminalManager = new TerminalManager();


describe('cmd-parameter-version', function() {
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-version');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });

    
    it('should show application version when -v and --version arguments are passed', function() {
        
        expect(testsGlobalHelper.execTbCmd('-v')).toContain(setupModule.getBuilderVersion());
        expect(testsGlobalHelper.execTbCmd('--version')).toContain(setupModule.getBuilderVersion());
    });
    
    
    it('should show application version when -v and --version arguments are passed after creating an empty project', function() {
        
        testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-v')).toContain(setupModule.getBuilderVersion());
        expect(testsGlobalHelper.execTbCmd('--version')).toContain(setupModule.getBuilderVersion());
    }); 
});