'use strict';

/**
 * this module defines all the global constants and variables that are used by the builder
 * and gives them default values.
 */


const path = require('path');
const { StringUtils } = require('turbocommons-ts');
const { ConsoleManager } = require('turbodepot-node');
const { FilesManager } = require('turbodepot-node');


const fm = new FilesManager();
const cm = new ConsoleManager();


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
global.setupBuildTypes = {
    site_php: "site_php",
    server_php: "server_php",
    lib_php: "lib_php",
    lib_java: "lib_java",
    lib_js: "lib_js",
    lib_ts: "lib_ts",
    lib_angular: "lib_angular",
    app_angular: "app_angular",
    app_node_cmd: "app_node_cmd",
    test_project: "test_project"
};

/**
 * Defines the list of possible file and folder structures
 */
global.folderStructures = {
    struct_deploy: "struct_deploy",
    struct_customer: "struct_customer"
};

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
    turboDepotSetup: 'turbodepot.json',
    gitignore: '.gitignore',
    gitattributes: '.gitattributes',
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
    jscpdBin: '"' + path.resolve(__dirname + '/../../../node_modules/.bin/jscpd"'),
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
    projectFolderName: StringUtils.getPathElement(path.resolve('./')),
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
    target: path.resolve('./' + global.folderNames.target)
};


/**
 * Generates a list of absolute paths for files on the specified folder which full path matches any of the patterns
 * specified on the includeList parameter.
 *
 * TODO - Improve docs and move it to some global lib or similar
 */
global.getFilesFromIncludeList = function (rootPath, includeList, excludeList = []) {

    if(includeList.length <= 0){
        
        return [];
    }

    let includeListProcessed = [];
    let escapedDirSep = fm.dirSep() === '/' ? '\\/' : '\\\\';
    
    for (let include of includeList){
    
        includeListProcessed.push(StringUtils.replace(include, ['\\', '/', '.'], [escapedDirSep, escapedDirSep, '\\.']));        
    }

    let regex = new RegExp('^.*(' + includeListProcessed.join('|') + ').*$', 'i');

    let filesToInclude = fm.findDirectoryItems(rootPath, regex, 'absolute', 'files', -1, '', 'absolute');
    
    let result = [];
    
    for (let fileToInclude of filesToInclude){
    
        if(!isFileOnExcludeList(fileToInclude, excludeList)){
            
            result.push(fileToInclude);
        }
    }
    
    return result;
}


/**
 * Checks if the specified path contains any of the provided exclude patterns
 *
 * TODO - Improve docs and move it to some global lib or similar
 */
global.isFileOnExcludeList = function (rootPath, excludeList) {

    for (let exclude of excludeList){
    
        if(StringUtils.formatPath(rootPath, '/').includes(StringUtils.formatPath(exclude, '/'))){

            return true;
        }
    }
    
    return false;
}