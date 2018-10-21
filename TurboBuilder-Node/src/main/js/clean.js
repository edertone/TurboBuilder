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
exports.execute = function () {
    
    console.log("\nclean start");
    
    if(fm.isDirectory(global.runtimePaths.target) &&
            !fm.deleteDirectory(global.runtimePaths.target) &&
            !fm.isDirectoryEmpty(global.runtimePaths.target)){
        
        console.error('could not delete ' + global.runtimePaths.target);
    }
    
    // Delete all synced files
    for (let syncSetup of global.setup.sync) {
        
        if(syncSetup.type === "fileSystem" &&
                fm.isDirectory(syncSetup.destPath) &&
                !fm.deleteDirectory(syncSetup.destPath, false)){
            
            console.error("could not delete contents of " + syncSetup.destPath);
        }
        
        if(syncSetup.type === "ftp"){
            
            deleteRemoteSyncFolder(syncSetup);
        }
    }

    console.success("clean ok");
}


/**
 * Clean the configured remote sync ftp folder
 */
let deleteRemoteSyncFolder = function (syncSetup) {
    
    buildModule.checkWinSCPAvailable();
    
    let winscpExec = 'winscp /command';
        
    winscpExec += ' "open ftp://' + syncSetup.user + ':' + syncSetup.psw + '@' + syncSetup.host + '/"';
    winscpExec += ' "rm ' + syncSetup.remotePath + '/*.*"';
    winscpExec += ' "exit"';
    
    if(!console.exec(winscpExec, '', true)){
        
        console.error('Remote clean errors');
    }

    console.success('cleaned remote ftp: ' + syncSetup.host);
}