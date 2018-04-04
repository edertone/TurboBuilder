'use strict';

/**
 * this module defines all the global constants and variables that are used by the builder
 * and gives them default values.
 */


const path = require('path');


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
        setup: 'turbobuilder.xml',
        readme: 'README.md',
        todo: 'TODO.txt'
};

/**
 * All the relevant paths relative to the main installation folder
 */
global.installationPaths = {
        typeScriptBin: '"' + path.resolve(__dirname + '/../../../node_modules/.bin/tsc"'),
        typeDocBin: '"' + path.resolve(__dirname + '/../../../node_modules/.bin/typedoc"'),
        root: path.resolve(__dirname + '/../../..'),
        setupFile: path.resolve(__dirname + '/../../../' + global.fileNames.setup),
        readmeFile: path.resolve(__dirname + '/../../../' + global.fileNames.readme),
        extras: path.resolve(__dirname + '/../../../' + global.folderNames.extras),
        todoFile: path.resolve(__dirname + '/../../../extras/' + global.fileNames.todo),
        src: path.resolve(__dirname + '/../../../src'),
        target: path.resolve(__dirname + '/../../../' + global.folderNames.target),
        main: path.resolve(__dirname + '/../../../src/main'),
        test: path.resolve(__dirname + '/../../../src/test'),
        mainResources: path.resolve(__dirname + '/../../../src/main/resources')
};

/**
 * All the relevant paths relative to the folder where the application's been executed
 */
global.runtimePaths = {
        root: path.resolve('./'),
        setupFile: path.resolve('./' + global.fileNames.setup),
        readmeFile: path.resolve('./' + global.fileNames.readme),
        extras: path.resolve('./' + global.folderNames.extras),
        todoFile: path.resolve('./extras/' + global.fileNames.todo),
        src: path.resolve('./src'),
        target: path.resolve('./' + global.folderNames.target),
        main: path.resolve('./src/main'),
        test: path.resolve('./src/test'),
        mainResources: path.resolve('./src/main/resources')
};

/**
 * Validate process setup as defined in the main xml setup file
 * Check the xsd definition for documentation of each property
 */
global.setupValidate = {
        
        RunBeforeBuild : true,
        
        ProjectStructure : {
            enabled: true,
            forceExtrasFolder: true,
            forceReadmeFile: true,
            forceTODOFile: true,
            resourcesStructure: true,
            phpStructure: true,
            jsStructure: true,
            tsStructure: true,
            tsConfigFile: true,
            javaStructure: true,
            cssStructure: true,
            checkGitIgnore: true
        },
};

/**
 * Validate process setup as defined in the main xml setup file
 * Check the xsd definition for documentation of each property
 */
global.setupBuild = {
        
        keepUnPackedFiles : false,
        
        Ts : {
            enabled: false,
            createMergedTs: false,
            createMergedJs: false,
            compilerDeclarationFile: true,
            compilerStrict: true,
            compilerSourceMap: false,
            compilerTargets: "ES3,ES5,ES6"
        },
};