#!/usr/bin/env node

'use strict';


/**
 * Tests related to the version feature of the cmd app
 */


const utils = require('../test-utils');
const setupModule = require('./../../../main/js/setup');


describe('cmd-parameter-version', function() {
    
    beforeEach(function() {
        
        this.workdir = utils.createAndSwitchToTempFolder('test-version');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });

    
    it('should show application version when -v and --version arguments are passed', function() {
        
        expect(utils.exec('-v')).toContain(setupModule.getBuilderVersion());
        expect(utils.exec('--version')).toContain(setupModule.getBuilderVersion());
    });
    
    
    it('should show application version when -v and --version arguments are passed after creating an empty project', function() {
        
        utils.exec('-g lib_php');
        
        expect(utils.exec('-v')).toContain(setupModule.getBuilderVersion());
        expect(utils.exec('--version')).toContain(setupModule.getBuilderVersion());
    }); 
});