'use strict';

/**
 * this module defines all the global constants and variables that are used by the builder
 * and gives them default values.
 */


const path = require('path');
const { StringUtils } = require('turbocommons-ts');


/**
 * Flag that tells us if the release process is being executed
 */
global.isRelease = false;


/**
 * Contains all the turbo builder setup loaded from the project config file
 */
global.setup = null;


/**
 * Defines the list of possible project build setup types
 */
global.setupBuildTypes = ["site_php", "lib_php", "lib_java", "lib_js", "lib_ts"];


/**
 * All the relevant project folder names
 */
global.folderNames = {
    extras: 'extras',
    target: 'target'
};

/**
 * All the relevant project file names
 */
global.fileNames = {
    setup: 'turbobuilder.json',
    setupRelease: 'turbobuilder.release.json',
    turboSiteSetup: 'turbosite.json',
    gitignore: '.gitignore',
    readme: 'README.md'
};

/**
 * All the relevant paths relative to the main installation folder
 */
global.installationPaths = {
    typeDocBin: '"' + path.resolve(__dirname + '/../../../node_modules/.bin/typedoc"'),
    typeScriptBin: '"' + path.resolve(__dirname + '/../../../node_modules/.bin/tsc"'),
    webPackBin: '"' + path.resolve(__dirname + '/../../../node_modules/.bin/webpack"'),
    httpServerBin: '"' + path.resolve(__dirname + '/../../../node_modules/.bin/http-server"'),
    jasmineBin: '"' + path.resolve(__dirname + '/../../../node_modules/.bin/jasmine"'),
    root: path.resolve(__dirname + '/../../..'),
    setupFile: path.resolve(__dirname + '/../../../' + global.fileNames.setup),
    readmeFile: path.resolve(__dirname + '/../../../' + global.fileNames.readme),
    extras: path.resolve(__dirname + '/../../../' + global.folderNames.extras),
    todoFolder: path.resolve(__dirname + '/../../../extras/todo'),
    src: path.resolve(__dirname + '/../../../src'),
    target: path.resolve(__dirname + '/../../../' + global.folderNames.target),
    main: path.resolve(__dirname + '/../../../src/main'),
    test: path.resolve(__dirname + '/../../../src/test'),
    mainResources: path.resolve(__dirname + '/../../../src/main/resources'),
    testResources: path.resolve(__dirname + '/../../../src/test/resources')
};

/**
 * All the relevant paths relative to the folder where the application's been executed
 */
global.runtimePaths = {
    projectName: StringUtils.getPathElement(path.resolve('./')),
    root: path.resolve('./'),
    setupFile: path.resolve('./' + global.fileNames.setup),
    setupReleaseFile: path.resolve('./' + global.fileNames.setupRelease),
    readmeFile: path.resolve('./' + global.fileNames.readme),
    extras: path.resolve('./' + global.folderNames.extras),
    todoFolder: path.resolve('./extras/todo'),
    src: path.resolve('./src'),
    main: path.resolve('./src/main'),
    test: path.resolve('./src/test'),
    mainResources: path.resolve('./src/main/resources'),
    target: path.resolve('./' + global.folderNames.target),
    targetDevRoot: path.resolve('./' + global.folderNames.target + '/' + StringUtils.getPathElement(path.resolve('./')))
};