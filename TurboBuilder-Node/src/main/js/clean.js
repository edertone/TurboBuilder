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
    
    fm.deleteDirectory(global.runtimePaths.target);
    
    console.success('clean ok');
}