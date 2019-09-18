#!/usr/bin/env node

'use strict';


/**
 * Tests related to the help feature of the cmd app
 */


const utils = require('../cmd-parameter-test-utils');
const { TerminalManager } = require('turbodepot-node');


const terminalManager = new TerminalManager();


describe('cmd-parameter-help', function() {
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-help');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(utils.fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });
    
    
    it('should show help when no arguments are passed', function() {

        expect(testsGlobalHelper.execTbCmd('')).toContain("Usage: turbobuilder|tb [options]");
    }); 
    
    
    it('should show help when -h and --help arguments are passed', function() {

        expect(testsGlobalHelper.execTbCmd('-h')).toContain("Usage: turbobuilder|tb [options]");
        expect(testsGlobalHelper.execTbCmd('--help')).toContain("Usage: turbobuilder|tb [options]");
    });
    
    
    it('should show help when -h and --help arguments are passed after creating an empty project', function() {

        testsGlobalHelper.execTbCmd('-g lib_php');
        
        expect(testsGlobalHelper.execTbCmd('-h')).toContain("Usage: turbobuilder|tb [options]");
        expect(testsGlobalHelper.execTbCmd('--help')).toContain("Usage: turbobuilder|tb [options]");
    });
    
    it('should show help when no arguments are passed after creating an empty project', function() {

        testsGlobalHelper.execTbCmd('-g lib_php');
        
        expect(testsGlobalHelper.execTbCmd('')).toContain("Usage: turbobuilder|tb [options]");
    });
});