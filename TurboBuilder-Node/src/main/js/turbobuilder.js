#!/usr/bin/env node

'use strict';

/**
 * This is the main entry point for the turbobuilder command line application
 */

require('./globals');

const program = require('commander');
const { ObjectUtils } = require('turbocommons-ts');
const { StringUtils } = require('turbocommons-ts');
const { ConsoleManager } = require('turbodepot-node');
const { FilesManager } = require('turbodepot-node');
const setupModule = require('./setup');
const generateModule = require('./generate');
const validateModule = require('./validate');
const buildModule = require('./build');
const releaseModule = require('./release');
const testModule = require('./test');
const cleanModule = require('./clean');
const syncModule = require('./sync');


const cm = new ConsoleManager();
const fm = new FilesManager();


/**
 * Get information about all the application related versions
 */
let printVersionInfo = function () {

    let result = "\nturbobuilder: " + setupModule.getBuilderVersion();
    
    if (fm.isFile(global.runtimePaths.setupFile)) {
    
        result += "\n\n" + setupModule.getProjectName() + ': ' + setupModule.getProjectRepoSemVer(true);
    }
    
    return result;
}


/**
 * Show the contents of each one of the specified folder files in an organized and readable way
 *
 * TODO - Improve and move to consoleManager on turbodepot library
 */
let printFolderContents = function (path, headlineText) {

    if(fm.isDirectory(path)){
        
        let folderList = fm.getDirectoryList(global.runtimePaths.todoFolder);

        for(let item of folderList){
            
            let todoContents = fm.readFile(global.runtimePaths.todoFolder + fm.dirSep() + item);
            
            if(!StringUtils.isEmpty(todoContents)){
            
                cm.warning("\n" + headlineText + item);
                        
                cm.warning(todoContents);
            }
        }
    }
}


/**
 * This application uses the commander npm module to easily manage the command line args.
 * All cmd interface and options are defined here
 */
program
    .alias('tb')
    .version(printVersionInfo(), '-v, --version')
    .option('-g, --generate <type>', 'Create a full project or folders structure on the current directory. Allowed types: ' + ObjectUtils.getKeys(global.setupBuildTypes).concat(ObjectUtils.getKeys(global.folderStructures)).join(', '))
    .option('-l, --lint', 'Perform project validation as configured in ' + global.fileNames.setup)
    .option('-c, --clean', 'Clear all the built files and delete ' + global.folderNames.target + ' folder. If -s is executed at the same time, synced files will be also deleted')
    .option('-b, --build', 'Generate the project development version as configured in ' + global.fileNames.setup)
    .option('-t, --test', 'Execute all tests as configured in ' + global.fileNames.setup)
    .option('-r, --release', 'Generate the project production ready version as configured in ' + global.fileNames.setup)
    .option('-s, --sync', 'Mirror project folders to a remote location as configured in ' + global.fileNames.setup)
    .parse(process.argv);

// If none of the options have been passed, we will show the help
if(!program.generate &&
   !program.lint &&
   !program.clean &&
   !program.build &&
   !program.test &&
   !program.release &&
   !program.sync){
    
    program.help();
    process.exit(0);
}

// Initialize global release flag
if (program.release){
    
    global.isRelease = true;
}

//Build and release cannot be launched at the same time
if (program.build && program.release){
 
    cm.error('build and release cannot be executed at the same time. Please launch separately');
}

// Generate the default project files if necessary
if (program.generate){
    
    generateModule.execute(program.generate);
    process.exit(0);
}

// Initialize the builder setup and global variables
setupModule.init();

// Perform the project cleanup
if (program.clean){
 
    cleanModule.execute(program.sync ||
        (program.build && global.setup.sync && global.setup.sync.runAfterBuild) ||
        (program.release && global.setup.sync && global.setup.sync.runAfterBuild));
}

// Perform the validation as defined on xml setup, except if it is defined
// to be performed before build, cause it will be executed there
if (program.lint && 
    !(program.build && global.setup.validate.runBeforeBuild === true) &&
    !(program.release && global.setup.validate.runBeforeBuild === true)){
 
    validateModule.execute();
}

// Perform the build as defined on xml setup
if (program.build){
    
    buildModule.execute();
}

if (program.release){
    
    releaseModule.execute();
}

if (program.sync && !global.setup.sync.runAfterBuild){
    
    syncModule.execute();
}

if (program.test){
    
    if (!program.build && !program.release){
    
        let readline = require('readline');
        
        var rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        cm.warning('\n--test SHOULD be used at the same time with -b --build or -r --release.\n\nIF YOU RUN THE PROJECT TESTS WITHOUT PREVIOUSLY COMPILING YOUR PROJECT, RESULTS MAY NOT BE ACCURATE.', false);  
        
        rl.question('\nDo you still want to run the tests (Y/N)?', (answer) => {
        
            rl.close();
          
            if(answer.toLowerCase() === 'y'){
                
                testModule.execute();
            }
        });
        
    }else{
        
        testModule.execute();
    }
}

// Print the todo folder contents on console if necessary
if((global.setup.release.printTodoFiles && program.release) ||
        (global.setup.build.printTodoFiles && program.build)){
    
    printFolderContents(global.runtimePaths.todoFolder, 'TODO file : ');
}