#!/usr/bin/env node
'use strict';


/**
 * Tests related to the generate feature of the cmd app
 */


require('./../../../main/js/globals');
const utils = require('../test-utils');
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
        expect(utils.fm.isFile('./extras/todo/features.txt')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.txt')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/php')).toBe(true);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.sync.length).toBe(0);
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("phpUnit");
    });


    it('should generate lib_js project structure', function(){

        expect(utils.exec('-g lib_js')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.txt')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.txt')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/js')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/resources')).toBe(true);
        expect(utils.fm.isDirectory('./src/test/js')).toBe(true);
        expect(utils.fm.isFile('./src/main/js/utils/MyStaticClass.js')).toBe(true);
        expect(utils.fm.isFile('./src/main/js/model/MySingletonClass.js')).toBe(true);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_js')).toBe(true);
        expect(setup.sync.length).toBe(0);
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("jasmine");

        // TODO - Verificar que el turbobuilder no conte les propietats corresponents a php
    });


    it('should generate lib_ts project structure', function(){

        expect(utils.exec('-g lib_ts')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.txt')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.txt')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/ts')).toBe(true);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.sync.length).toBe(0);
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("jasmine");
    });


    it('should generate site_php project structure', function(){

        expect(utils.exec('--generate site_php')).toContain("Generated project structure ok");

        expect(utils.exec('-l')).toContain("validate ok");

        expect(utils.fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(utils.fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/features.txt')).toBe(true);
        expect(utils.fm.isFile('./extras/todo/tests.txt')).toBe(true);
        expect(utils.fm.isDirectory('./src/main/resources')).toBe(true);

        let setup = utils.readSetupFile();
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('replaceVersion')).toBe(true);
        expect(setup.build.replaceVersion.wildCard).toBe("@@--build-version--@@");
        expect(setup.build.replaceVersion.extensions.length).toBe(3);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.sync.length).toBe(1);
        expect(setup.test.length).toBe(1);
        expect(setup.test[0].type).toBe("jasmine");
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
});