'use strict';


/**
 * Tests related to the docker features of the cmd app
 */


require('./../../../main/js/globals');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');

const fm = new FilesManager();
const terminalManager = new TerminalManager();


describe('cmd-parameter-build', function() {
    
    beforeEach(function() {
        
        this.tempDir = terminalManager.createTempDirectory('test-build');
    });

    
    afterEach(function() {
  
        terminalManager.setInitialWorkDir();
        
        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });
    
    
    it('should correctly run the default docker container when using the -du parameter on a newly generated site_php project', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        let upResult = testsGlobalHelper.execTbCmd('-du');
        expect(upResult).toContain("This is a DEVELOPMENT docker project");
        expect(upResult).toContain("Docker containers started successfully");
        
        let downResult = testsGlobalHelper.execTbCmd('-dd');
        expect(downResult).toContain("Docker stop containers (please wait)");
        expect(downResult).toContain("ok");
                
    });  
        
    
    it('should show an errror when calling the -du command on a site_php project that has no docker containers specified on turbobuilder setup', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.containers.docker = [];
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let upResult = testsGlobalHelper.execTbCmd('-du');
        expect(upResult).toContain("No docker containers could be started. Check turbobuilder setup");
    });
    
      
    it('should show an errror when calling the -du command on a site_php project that has an empty container path specified on turbobuilder setup', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.containers.docker = [
            {
                "path": "",
                "startPolicy": "always"
            }];
            
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let upResult = testsGlobalHelper.execTbCmd('-du');
        expect(upResult).toContain("invalid Docker container template name ''");
    });  
    
    
    it('should correctly start the basic apache2-4-dev docker container when setting it on the project setup for a created site_php project', function() {

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        setup.containers.docker = [
            {
                "path": "apache2-4-dev",
                "startPolicy": "always"
            }];
            
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        let upResult = testsGlobalHelper.execTbCmd('-du');
        expect(upResult).toContain("Docker start containers (apache2-4-dev)");
        expect(upResult).toContain("Docker containers started successfully");
        
        let downResult = testsGlobalHelper.execTbCmd('-dd');
        expect(downResult).toContain("Docker stop containers (please wait)");
        expect(downResult).toContain("ok");
    });  
});