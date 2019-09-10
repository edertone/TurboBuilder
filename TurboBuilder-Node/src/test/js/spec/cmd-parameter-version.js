#!/usr/bin/env node

'use strict';


/**
 * Tests related to the version feature of the cmd app
 */


const utils = require('../cmd-parameter-test-utils');
const setupModule = require('./../../../main/js/setup');
const { TerminalManager } = require('turbodepot-node');


const terminalManager = new TerminalManager();


describe('cmd-parameter-version', function() {
    
    beforeEach(function() {
        
        this.workdir = terminalManager.createTempDirectory('test-version');
    });

    
    afterEach(function() {
  
        switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBeGreaterThan(-1);
    });

    
    it('should show application version when -v and --version arguments are passed', function() {
        
        expect(utils.exec('-v')).toContain(setupModule.getBuilderVersion());
        expect(utils.exec('--version')).toContain(setupModule.getBuilderVersion());
    });
    
    
    it('should show application version when -v and --version arguments are passed after creating an empty project', function() {
        
        utils.generateProjectAndSetTurbobuilderSetup('lib_php', null, []);
        
        expect(utils.exec('-v')).toContain(setupModule.getBuilderVersion());
        expect(utils.exec('--version')).toContain(setupModule.getBuilderVersion());
    }); 
});