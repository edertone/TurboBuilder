#!/usr/bin/env node

'use strict';


/**
 * Tests related to the test feature of the cmd app
 */


const utils = require('../test-utils');


describe('cmd-parameter-test', function() {
    
    beforeEach(function() {
        
        this.workdir = utils.createAndSwitchToTempFolder('test-test');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });
    
    
    it('should fail on empty project', function() {

        expect(utils.exec('-t')).toContain("setup file not found");
        
        expect(utils.exec('--test')).toContain("setup file not found");
    });

    
    it('should fail when test is passed as the only parameter', function() {

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        expect(utils.exec('-t')).toContain('--test must be used at the same time as -b --build or -r --release');
        expect(utils.exec('--test')).toContain('--test must be used at the same time as -b --build or -r --release');
    });
    
    
    it('should fail when no tests are defined on setup', function() {

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let setup = utils.readSetupFile();
 
        setup.test = [];
        
        expect(utils.saveToSetupFile(setup)).toBe(true);
        
        expect(utils.exec('-bt')).toContain('Nothing to test. Please setup some tests on test section');
    });
});