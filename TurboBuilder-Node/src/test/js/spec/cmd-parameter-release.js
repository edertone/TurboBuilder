#!/usr/bin/env node

'use strict';


/**
 * Tests related to the release feature of the cmd app
 */


require('./../../../main/js/globals');
const utils = require('../test-utils');
const { StringUtils } = require('turbocommons-ts');


describe('cmd-parameter-release', function() {
    
    beforeEach(function() {
        
        this.workdir = utils.createAndSwitchToTempFolder('test-release');
    });

    
    afterEach(function() {
  
        utils.switchToExecutionDir();
        
        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });
    
    
    it('should include project semver (0.0.0) inside all generated release merged JS on a non git project', function() {

        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        let launchResult = utils.exec('-cr');        
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("changelog failed");
        expect(launchResult).toContain("release ok");
        expect(launchResult).toContain("0.0.0");
        
        let mergedContent = utils.fm.readFile(
            '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'es5' + sep + 'PackedJsFileName-ES5.js');
        
        expect(mergedContent.substr(0, 9)).toBe("// 0.0.0\n");
        
        mergedContent = utils.fm.readFile(
                '.' + sep + 'target' + sep + folderName + '-0.0.0' + sep + 'dist' + sep + 'es6' + sep + 'PackedJsFileName-ES6.js');
            
        expect(mergedContent.substr(0, 9)).toBe("// 0.0.0\n");
    });
    
    
    it('should include project semver (0.4.0) inside all generated release merged JS on a git project with created tags', function() {

        let sep = utils.fm.dirSep();
        let folderName = StringUtils.getPathElement(this.workdir);
        
        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");
        
        expect(utils.execCmdCommand('git init')).toContain("Initialized empty Git repository");
        utils.execCmdCommand('git add .');
        utils.execCmdCommand('git commit -m "test commit"');
        utils.execCmdCommand('git tag 0.1.0');
        
        utils.fm.saveFile('.' + sep + 'test.txt');
        utils.execCmdCommand('git add .');
        utils.execCmdCommand('git commit -m "test commit 2"');
        
        utils.execCmdCommand('git tag 0.4.0');
        
        let launchResult = utils.exec('-cr');        
        expect(launchResult).toContain("clean start");
        expect(launchResult).toContain("clean ok");
        expect(launchResult).toContain("release start");
        expect(launchResult).toContain("release ok");
        expect(launchResult).toContain("0.4.0");
        
        let mergedContent = utils.fm.readFile(
            '.' + sep + 'target' + sep + folderName + '-0.4.0' + sep + 'dist' + sep + 'es5' + sep + 'PackedJsFileName-ES5.js');
        
        expect(mergedContent.substr(0, 9)).toBe("// 0.4.0\n");
        
        mergedContent = utils.fm.readFile(
                '.' + sep + 'target' + sep + folderName + '-0.4.0' + sep + 'dist' + sep + 'es6' + sep + 'PackedJsFileName-ES6.js');
            
        expect(mergedContent.substr(0, 9)).toBe("// 0.4.0\n");
    });
});