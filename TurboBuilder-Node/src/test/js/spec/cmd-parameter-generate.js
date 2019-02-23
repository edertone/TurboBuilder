#!/usr/bin/env node
'use strict';


/**
 * Tests related to the generate feature of the cmd app
 */


require('./../../../main/js/globals');
const utils = require('../cmd-parameter-test-utils');
const setupModule = require('./../../../main/js/setup');


describe('cmd-parameter-generate', function(){

    beforeEach(function(){

        this.workdir = utils.createAndSwitchToTempFolder('test-generate');
    });


    afterEach(function(){

        utils.switchToExecutionDir();

        expect(utils.fm.deleteDirectory(this.workdir)).toBe(true);
    });


    it('should fail when -g and --generate arguments are passed without parameters or with wrong parameters', function(){

        expect(utils.exec('-g')).toContain("argument missing");
        expect(utils.exec('-g someinvalidvalue')).toContain("invalid project type. Allowed types: " + global.setupBuildTypes.join(', '));

        expect(utils.exec('--generate')).toContain("argument missing");
        expect(utils.exec('--generate someinvalidvalue')).toContain("invalid project type. Allowed types: " + global.setupBuildTypes.join(', '));
    });


    it('should generate lib_php project structure', function(){

        expect(utils.exec('-g lib_php')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/php')).toBe(true);
        expect(utils.fm.isDirectory('./src/test/php')).toBe(true);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.enabled).toBe(false);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.hasOwnProperty("sync")).toBe(false);
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("phpUnit");
    });


    it('should generate lib_js project structure', function(){

        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/js')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/resources')).toBe(true);
        expect(utils.fm.isDirectory('./src/test/js')).toBe(true);
        expect(utils.fm.isFile('./src/main/js/utils/MyStaticClass.js')).toBe(true);
        expect(utils.fm.isFile('./src/main/js/model/MySingletonClass.js')).toBe(true);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.enabled).toBe(false);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_js')).toBe(true);
        expect(setup.hasOwnProperty("sync")).toBe(false);
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("jasmine");
    });


    it('should generate lib_ts project structure', function(){

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/ts')).toBe(true);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.enabled).toBe(false);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.hasOwnProperty("sync")).toBe(false);
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("jasmine");
    });


    it('should generate site_php project structure', function(){

        expect(utils.exec('--generate site_php')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.fm.isFile('./turbosite.json')).toBe(true);
        expect(utils.fm.isFile('./turbosite.release.json')).toBe(true);
        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/resources')).toBe(true);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.enabled).toBe(false);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('site_php')).toBe(true);
        expect(setup.build.hasOwnProperty('server_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.sync.type).toBe("fileSystem");
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("jasmine");
    });
    
    
    it('should generate server_php project structure', function(){

        expect(utils.exec('--generate server_php')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.fm.isFile('./turbosite.json')).toBe(true);
        expect(utils.fm.isFile('./turbosite.release.json')).toBe(true);
        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/resources')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/resources/fonts')).toBe(false);
        expect(utils.fm.isDirectory('./src/main/view')).toBe(false);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.enabled).toBe(false);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('server_php')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.sync.type).toBe("fileSystem");
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("phpUnit");
    });


    it('should fail when generate is called twice on the same folder', function(){

        expect(utils.exec('-g lib_php')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.exec('--generate lib_php')).toContain('File ' + global.fileNames.setup + ' already exists');
    });


    it('should fail when called on a non empty folder', function(){

        expect(utils.fm.saveFile('./someFile.txt', 'file contents')).toBe(true);

        expect(utils.exec('-g lib_php')).toContain('Current folder is not empty! :');
        expect(utils.exec('--generate lib_php')).toContain('Current folder is not empty! :');
    });


    it('should fail when generated setup builderVersion value is modified with invalid value', function(){

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");

        let setup = utils.readSetupFile();

        setup.metadata.builderVersion = '';

        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-l')).toContain("metadata.builderVersion not specified on");

        setup.metadata.builderVersion = setupModule.getBuilderVersion() + '.9';

        expect(utils.saveToSetupFile(setup)).toBe(true);

        expect(utils.exec('-l')).toContain("Warning: Current turbobuilder version");
    });
    
    
    it('should generate app_angular project structure', function() {

        let generateResult = utils.exec('--generate app_angular');
        expect(generateResult).toContain("NOT FINISHED YET! - Remember to follow the instructions on TODO.md");
        expect(generateResult).toContain("Generated project structure ok");
        
        expect(utils.fm.isFile('./TODO.md')).toBe(true);
        expect(utils.fm.isFile('./README.md')).toBe(true);
        expect(utils.fm.isFile('./tslint.json')).toBe(true);
        expect(utils.fm.isFile('./turbobuilder.json')).toBe(true);
        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.todo')).toBe(true);

        expect(utils.fm.readFile('./tslint.json')).toContain('"extends": "./tslint-angular.json"');

        let setup = utils.readSetupFile();
        
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('app_angular')).toBe(true);
        expect(setup.build.hasOwnProperty('optimizePictures')).toBe(false);
        expect(setup.build.hasOwnProperty('generateCodeDocumentation')).toBe(false);
        expect(setup.test.length).toBe(0);
    });
    
    
    it('should generate lib_angular project structure', function() {
        
        // TODO
    });
});