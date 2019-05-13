'use strict';

/**
 * this module contains all the code related to the clean process
 */


const { FilesManager } = require('turbodepot-node');
const console = require('./console.js');
const buildModule = require('./build');
const setupModule = require('./setup');


let fm = new FilesManager();


/**
 * Execute the clean process
 */
exports.execute = function (alsoCleanSync = false) {
    
    console.log("\nclean start");
    
    if(global.setup.build.app_node_cmd){
        
        return console.success('Clean is not necessary for node cmd apps');
    }
    
    if(fm.isDirectory(global.runtimePaths.target) &&
            !fm.deleteDirectory(global.runtimePaths.target) &&
            !fm.isDirectoryEmpty(global.runtimePaths.target)){
        
        console.error('could not delete ' + global.runtimePaths.target);
    }
    
    // Delete all synced files if necessary
    if(alsoCleanSync){
        
        // Load the non release setup and execute the clean for it
        cleanSyncDests(setupModule.loadSetupFromDisk());
                
        // Load the release setup and execute the clean for it
         if(fm.isFile(global.runtimePaths.setupReleaseFile)){
             
             cleanSyncDests(setupModule.loadReleaseSetupFromDisk());
         }
    }
    
    console.success("clean ok");
}


/**
 * Clean the configured remote sync ftp and or filesystem destinations
 */
let cleanSyncDests = function (setup) {
    
    if(setup.sync && setup.sync.type === "fileSystem" &&
        fm.isDirectory(setup.sync.destPath) &&
        !fm.deleteDirectory(setup.sync.destPath, false)){
         
         console.error("could not delete contents of " + setup.sync.destPath);
     }
     
     if(setup.sync && setup.sync.type === "ftp"){

         deleteRemoteSyncFolder(setup);
     }
}


/**
 * Clean the configured remote sync ftp folder
 */
let deleteRemoteSyncFolder = function (setup) {
    
    buildModule.checkWinSCPAvailable();
    
    let winscpExec = 'winscp /command';
        
    winscpExec += ' "open ftp://' + setup.sync.user + ':' + setup.sync.psw + '@' + setup.sync.host + '/"';
    winscpExec += ' "rm ' + setup.sync.remotePath + '/*.*"';
    winscpExec += ' "exit"';
    
    if(!console.exec(winscpExec, '', true)){
        
        console.error('Remote clean errors');
    }

    console.success('cleaned remote ftp: ' + setup.sync.host + ' ' + setup.sync.remotePath);
}