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
    
    console.success("clean ok");
}