'use strict';

/**
 * this module contains all the code related to the clean process
 */


const { FilesManager } = require('turbocommons-ts');
const console = require('./console.js');
const buildModule = require('./build');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Execute the clean process
 */
exports.execute = function (alsoCleanSync = false) {
    
    console.log("\nclean start");
    
    if(fm.isDirectory(global.runtimePaths.target) &&
            !fm.deleteDirectory(global.runtimePaths.target) &&
            !fm.isDirectoryEmpty(global.runtimePaths.target)){
        
        console.error('could not delete ' + global.runtimePaths.target);
    }
    
    // Delete all synced files if necessary
    if(alsoCleanSync){
        
        if(global.setup.sync && global.setup.sync.type === "fileSystem" &&
            fm.isDirectory(global.setup.sync.destPath) &&
            !fm.deleteDirectory(global.setup.sync.destPath, false)){
             
             console.error("could not delete contents of " + global.setup.sync.destPath);
         }
         
         if(global.setup.sync && global.setup.sync.type === "ftp"){
             
             deleteRemoteSyncFolder();
         }
    }
    
    console.success("clean ok");
}


/**
 * Clean the configured remote sync ftp folder
 */
let deleteRemoteSyncFolder = function () {
    
    buildModule.checkWinSCPAvailable();
    
    let winscpExec = 'winscp /command';
        
    winscpExec += ' "open ftp://' + global.setup.sync.user + ':' + global.setup.sync.psw + '@' + global.setup.sync.host + '/"';
    winscpExec += ' "rm ' + global.setup.sync.remotePath + '/*.*"';
    winscpExec += ' "exit"';
    
    if(!console.exec(winscpExec, '', true)){
        
        console.error('Remote clean errors');
    }

    console.success('cleaned remote ftp: ' + global.setup.sync.host);
}