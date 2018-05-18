#!/usr/bin/env node

'use strict';


/**
 * Tests related to the help feature of the cmd app
 */


const utils = require('../test-utils');


describe('cmd-parameter-help', function() {
    
    beforeEach(function() {
        
        this.workdir = utils.createAndSwitchToTempFolder('test-help');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });
    
    
    it('should show help when no arguments are passed', function() {

        expect(utils.exec('')).toContain("Usage: turbobuilder|tb [options]");
    }); 
    
    
    it('should show help when -h and --help arguments are passed', function() {

        expect(utils.exec('-h')).toContain("Usage: turbobuilder|tb [options]");
        expect(utils.exec('--help')).toContain("Usage: turbobuilder|tb [options]");
    });
    
    
    it('should show help when -h and --help arguments are passed after creating an empty project', function() {

        utils.exec('-g lib_php');
        
        expect(utils.exec('-h')).toContain("Usage: turbobuilder|tb [options]");
        expect(utils.exec('--help')).toContain("Usage: turbobuilder|tb [options]");
    });
    
    it('should show help when no arguments are passed after creating an empty project', function() {

        utils.exec('-g lib_php');
        
        expect(utils.exec('')).toContain("Usage: turbobuilder|tb [options]");
    });
});