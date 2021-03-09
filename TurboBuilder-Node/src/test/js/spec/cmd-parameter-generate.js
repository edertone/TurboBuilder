'use strict';


/**
 * Tests related to the generate feature of the cmd app
 */


require('./../../../main/js/globals');
const setupModule = require('./../../../main/js/setup');
const { ObjectUtils } = require('turbocommons-ts');
const { FilesManager, TerminalManager } = require('turbodepot-node');
const { TurboSiteTestsManager } = require('turbotesting-node');


const fm = new FilesManager();
const tsm = new TurboSiteTestsManager('./');
const terminalManager = new TerminalManager();


describe('cmd-parameter-generate', function(){

    beforeEach(function(){

        this.tempDir = terminalManager.createTempDirectory('test-generate');
    });


    afterEach(function(){

        terminalManager.setInitialWorkDir();

        expect(fm.deleteDirectory(this.tempDir)).toBeGreaterThan(-1);
    });


    it('should fail when -g and --generate arguments are passed without parameters or with wrong parameters', function(){

        expect(testsGlobalHelper.execTbCmd('-g')).toContain("argument missing");
        expect(testsGlobalHelper.execTbCmd('-g someinvalidvalue')).toContain("invalid project type. Allowed types:\n\n" +
            ObjectUtils.getKeys(global.setupBuildTypes).concat(ObjectUtils.getKeys(global.folderStructures)).join("\n"));

        expect(testsGlobalHelper.execTbCmd('--generate')).toContain("argument missing");
        expect(testsGlobalHelper.execTbCmd('--generate someinvalidvalue')).toContain("invalid project type. Allowed types:\n\n" +
            ObjectUtils.getKeys(global.setupBuildTypes).concat(ObjectUtils.getKeys(global.folderStructures)).join("\n"));
    });


    it('should generate lib_php project structure', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");

        expect(fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(fm.isFile('.gitignore')).toBe(true);
        expect(fm.isFile('.gitattributes')).toBe(true);
        expect(fm.isDirectory('./src/main/php')).toBe(true);
        expect(fm.isDirectory('./src/test/php')).toBe(true);

        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.hasOwnProperty('wildCards')).toBe(false);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.hasOwnProperty("sync")).toBe(false);
        expect(setup.test.enabledTests.length).toBe(1);
        expect(setup.test.enabledTests[0].type).toBe("phpUnit");
    });


    it('should generate lib_js project structure', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_js', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");

        expect(fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(fm.isFile('.gitignore')).toBe(true);
        expect(fm.isFile('.gitattributes')).toBe(true);
        expect(fm.isDirectory('./src/main/js')).toBe(true);
        expect(fm.isDirectory('./src/main/resources')).toBe(true);
        expect(fm.isDirectory('./src/test/js')).toBe(true);
        expect(fm.isFile('./src/main/js/utils/MyStaticClass.js')).toBe(true);
        expect(fm.isFile('./src/main/js/model/MySingletonClass.js')).toBe(true);

        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.hasOwnProperty('wildCards')).toBe(false);
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.validate.hasOwnProperty('angularApp')).toBe(false);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_js')).toBe(true);
        expect(setup.hasOwnProperty("sync")).toBe(false);
        expect(setup.test.enabledTests.length).toBe(1);
        expect(setup.test.enabledTests[0].type).toBe("jasmine");
    });


    it('should generate lib_ts project structure', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");

        expect(fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(fm.isDirectory('./src/main/ts')).toBe(true);
        expect(fm.isFile('.gitignore')).toBe(true);
        expect(fm.isFile('.gitattributes')).toBe(true);

        expect(setup.hasOwnProperty('wildCards')).toBe(false);
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.hasOwnProperty("sync")).toBe(false);
        expect(setup.test.enabledTests.length).toBe(1);
        expect(setup.test.enabledTests[0].type).toBe("jasmine");
    });


    it('should generate site_php project structure', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('site_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");

        expect(fm.isFile('./turbosite.json')).toBe(true);
        expect(fm.isFile('./turbosite.release.json')).toBe(true);
        expect(fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(fm.isFile('./extras/help/upgrade-dependencies.md')).toBe(true);
        expect(fm.readFile('./extras/help/upgrade-dependencies.md')).toContain('Update the library versions at the index.php file');
        expect(fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(fm.isDirectory('./src/main/resources')).toBe(true);
        expect(fm.isFile('.gitignore')).toBe(true);
        expect(fm.isFile('.gitattributes')).toBe(true);

        expect(setup.hasOwnProperty('wildCards')).toBe(false);
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(true);
        expect(setup.build.hasOwnProperty('server_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.sync.type).toBe("fileSystem");
        expect(setup.test.enabledTests.length).toBe(1);
        expect(setup.test.enabledTests[0].type).toBe("jasmine");
        
        expect(fm.readFile('./src/main/error-404.php')).toContain('Redirecting to');
    });
    
    
    it('should generate server_php project structure', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('server_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");

        expect(fm.isFile('./turbosite.json')).toBe(true);
        expect(fm.isFile('./turbosite.release.json')).toBe(true);
        expect(fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(fm.isDirectory('./src/main/resources')).toBe(true);
        expect(fm.isDirectory('./src/main/resources/fonts')).toBe(false);
        expect(fm.isDirectory('./src/main/view')).toBe(false);
        expect(fm.isFile('.gitignore')).toBe(true);
        expect(fm.isFile('.gitattributes')).toBe(true);

        expect(setup.hasOwnProperty('wildCards')).toBe(false);
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('server_php')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.sync.type).toBe("fileSystem");
        expect(setup.test.enabledTests.length).toBe(1);
        expect(setup.test.enabledTests[0].type).toBe("phpUnit");
        
        expect(fm.readFile('./src/main/error-404.php')).not.toContain('Redirecting to');
    });


    it('should fail when generate is called twice on the same folder', function(){

        testsGlobalHelper.generateProjectAndSetup('lib_php', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");

        expect(testsGlobalHelper.execTbCmd('--generate lib_php')).toContain('File ' + global.fileNames.setup + ' already exists');
    });


    it('should fail when called on a non empty folder', function(){

        expect(fm.saveFile('./someFile.txt', 'file contents')).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-g lib_php')).toContain('Current folder is not empty! :');
        expect(testsGlobalHelper.execTbCmd('--generate lib_php')).toContain('Current folder is not empty! :');
    });


    it('should fail when generated setup builderVersion value is modified with invalid value', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('lib_ts', null, []);
        
        setup.metadata.builderVersion = '';

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-l')).toContain("metadata.builderVersion not specified on");

        setup.metadata.builderVersion = setupModule.getBuilderVersion() + '.9';

        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);

        expect(testsGlobalHelper.execTbCmd('-l')).toContain("Warning: Current turbobuilder version");
    });
    
    
    it('should generate app_angular project structure', function() {

        let generateResult = testsGlobalHelper.execTbCmd('--generate app_angular');
        expect(generateResult).toContain("NOT FINISHED YET! - Remember to follow the instructions on TODO.md");
        expect(generateResult).toContain("Generated project structure ok");
        
        expect(fm.isFile('./TODO.md')).toBe(true);
        expect(fm.isFile('./README.md')).toBe(true);
        expect(fm.isFile('./tslint.json')).toBe(true);
        expect(fm.isFile('./turbobuilder.json')).toBe(true);
        expect(fm.isFile('./src/htaccess.txt')).toBe(true);
        expect(fm.isFile('./src/assets/favicons/196x196.png')).toBe(true);
        expect(fm.isFile('./src/assets/favicons/readme.txt')).toBe(true);
        expect(fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(fm.isFile('.gitignore')).toBe(true);
        expect(fm.isFile('.gitattributes')).toBe(true);

        expect(fm.readFile('./tslint.json')).toContain('"extends": "./tslint-angular.json"');

        let setup = tsm.getSetup('turbobuilder');
        
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.copyrightHeaders.length).toBe(0);
        expect(setup.build.hasOwnProperty('app_angular')).toBe(true);
        expect(setup.build.hasOwnProperty('optimizePictures')).toBe(false);
        expect(setup.build.hasOwnProperty('generateCodeDocumentation')).toBe(false);
        expect(setup.test.enabledTests.length).toBe(0);
    });
    
    
    it('should generate app_node_cmd project structure', function(){

        let setup = testsGlobalHelper.generateProjectAndSetup('app_node_cmd', null, []);
        
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");

        expect(fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(fm.readFile('./extras/help/debug.md')).toContain('# How to debug a node app with chrome dev tools');
        expect(fm.isFile('./extras/help/publish-release.md')).toBe(true);
        expect(fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(fm.isFile('./extras/todo/features.todo')).toBe(true);
        expect(fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(fm.isFile('./src/main/js/main.js')).toBe(true);
        expect(fm.isDirectory('./src/main/resources')).toBe(true);
        expect(fm.isDirectory('./src/test/js')).toBe(true);
        expect(fm.isFile('.gitignore')).toBe(true);
        expect(fm.isFile('.gitattributes')).toBe(true);
        
        expect(setup.hasOwnProperty('wildCards')).toBe(false);
        expect(setup.metadata.builderVersion).toBe(setupModule.getBuilderVersion());
        expect(setup.validate.filesContent.hasOwnProperty('copyrightHeaders')).toBe(true);
        expect(setup.validate.hasOwnProperty('styleSheets')).toBe(false);
        expect(setup.build.hasOwnProperty('printTodoFiles')).toBe(true);
        expect(setup.build.hasOwnProperty('site_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_php')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_ts')).toBe(false);
        expect(setup.build.hasOwnProperty('lib_js')).toBe(false);
        expect(setup.build.hasOwnProperty("app_node_cmd")).toBe(true);
        expect(ObjectUtils.getKeys(setup.release).length).toBe(0);
        expect(setup.hasOwnProperty('sync')).toBe(false);
        expect(setup.test.enabledTests.length).toBe(1);
        expect(setup.test.enabledTests[0].type).toBe("jasmine");
    });
    
    
    it('should generate lib_angular project structure', function() {
        
        // TODO - lib_angular generation is still not implemented!
    });
    
    
    it('should generate struct_deploy folders structure', function() {
        
        expect(testsGlobalHelper.execTbCmd('-g struct_deploy')).toContain("Generated folders structure ok");

        expect(fm.isDirectory('./_dev')).toBe(true);
        expect(fm.isDirectory('./_trash')).toBe(true);
        expect(fm.isDirectory('./site')).toBe(true);
        expect(fm.isDirectory('./storage/cache')).toBe(true);
        expect(fm.isDirectory('./storage/custom')).toBe(true);
        expect(fm.isDirectory('./storage/db')).toBe(true);
        expect(fm.isDirectory('./storage/data')).toBe(true);
        expect(fm.isDirectory('./storage/executable')).toBe(true);
        expect(fm.isDirectory('./storage/logs')).toBe(true);
        expect(fm.isDirectory('./storage/tmp')).toBe(true);
        expect(fm.isFile('./storage/README.txt')).toBe(true);
           
        expect(fm.getDirectoryList('./').length).toBe(4);
        expect(fm.getDirectoryList('./storage').length).toBe(8);
    });
    
    
    it('should generate struct_customer folders structure', function() {
        
        expect(testsGlobalHelper.execTbCmd('-g struct_customer')).toContain("Generated folders structure ok");

        expect(fm.isDirectory('./Documents')).toBe(true);
        expect(fm.isFile('./Documents/Contact.md')).toBe(true);
        expect(fm.isFile('./Documents/Passwords.md')).toBe(true);
        expect(fm.getDirectoryList('./Documents').length).toBe(2);
        
        expect(fm.isDirectory('./Release')).toBe(true);
        expect(fm.isDirectory('./Repo')).toBe(true);
        expect(fm.isDirectory('./Trash')).toBe(true);
        
        expect(fm.getDirectoryList('./').length).toBe(4);
    });
    
    
    it('should generate test_project project structure', function() {
        
        expect(testsGlobalHelper.execTbCmd('-g test_project')).toContain("Generated project structure ok");

        expect(fm.isFile('./extras/help/debug.md')).toBe(true);
        expect(fm.readFile('./extras/help/debug.md')).toContain('# How to debug tests');
        expect(fm.isFile('./extras/help/publish-release.md')).toBe(false);
        expect(fm.isFile('./extras/help/tests.md')).toBe(true);
        expect(fm.isFile('./extras/todo/features.todo')).toBe(false);
        expect(fm.isFile('./extras/todo/tests.todo')).toBe(true);
        expect(fm.isDirectory('./src/main')).toBe(false);
        expect(fm.isFile('./src/test/js/helpers/TestsGlobalHelper.js')).toBe(true);
        expect(fm.isFile('./src/test/js/spec/test-spec-template.js')).toBe(true);
        expect(fm.isFile('./src/test/js/jasmine.json')).toBe(true);
        expect(fm.isFile('.gitignore')).toBe(true);
        expect(fm.isFile('.gitattributes')).toBe(true);
        expect(fm.isFile('package.json')).toBe(true);
                
        expect(fm.getDirectoryList('./').length).toBe(7);
    });
    
    
    it('should correctly validate project after being created with test_project', function() {
        
        expect(testsGlobalHelper.execTbCmd('-g test_project')).toContain("Generated project structure ok");
        expect(testsGlobalHelper.execTbCmd('-l')).toContain("validate ok");
    });
    
    
    it('should generate a minimal turbobuilder.json file when test_project project is created', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('test_project', null, null);
        
        expect(setup.hasOwnProperty('validate')).toBe(false);
        expect(Object.keys(setup.build).length).toBe(1);
        expect(setup.hasOwnProperty('release')).toBe(false);
        expect(setup.hasOwnProperty('sync')).toBe(false);
        expect(setup.test.warnIfCalledWithoutBuild).toBe(false);
    });
    
    
    it('should correctly execute default empty tests on a newly created test_project project', function() {
        
        expect(testsGlobalHelper.execTbCmd('-g test_project')).toContain("Generated project structure ok");
        terminalManager.exec('npm install');
        expect(testsGlobalHelper.execTbCmd('-t')).toContain("test done");
    });
    
    
    it('should fail tests execution if jasmine setup path is not valid', function() {
        
        let setup = testsGlobalHelper.generateProjectAndSetup('test_project', null, null);
        
        setup.test.enabledTests[0].jasmineConfig = 'src/test/js/jasmineinvalid.json';
        
        expect(testsGlobalHelper.saveToSetupFile(setup)).toBe(true);
        
        terminalManager.exec('npm install');
        expect(testsGlobalHelper.execTbCmd('-t')).toMatch(/Could not find jasmine config file[\s\S]*jasmineinvalid.json/);
    });
});