'use strict';

/**
 * this module contains all the code related to the clean process
 */


const { FilesManager } = require('turbocommons-ts');
const console = require('./console.js');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Execute the clean process
 */
exports.execute = function () {
    
    console.log("\nclean start");
    
    if(fm.isDirectory(global.runtimePaths.target) &&
            !fm.deleteDirectory(global.runtimePaths.target) &&
            !fm.isDirectoryEmpty(global.runtimePaths.target)){
        
        console.error('could not delete ' + global.runtimePaths.target);
    }
    
    // Delete all synced files from filesystem
    for (let syncSetup of global.setup.sync) {
        
        if(syncSetup.type === "fileSystem" &&
                fm.isDirectory(syncSetup.destPath) &&
                !fm.deleteDirectory(syncSetup.destPath, false)){
            
            console.error("could not delete contents of " + syncSetup.destPath);
        }
    }

    console.success("clean ok");
}