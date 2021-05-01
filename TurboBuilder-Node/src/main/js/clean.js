'use strict';

/**
 * this module contains all the code related to the clean process
 */


const { FilesManager } = require('turbodepot-node');
const { ConsoleManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');
const syncModule = require('./sync');


let fm = new FilesManager();
const cm = new ConsoleManager();
const terminalManager = new TerminalManager();


/**
 * Execute the clean process
 */
exports.execute = function (alsoCleanSync = false) {
    
    cm.text("\nclean start");
    
    if(fm.isDirectory(global.runtimePaths.target)){
        
        try{
            
            fm.deleteDirectory(global.runtimePaths.target);
            
        }catch(e){
            
            if(!fm.isDirectoryEmpty(global.runtimePaths.target)){
                
                cm.error('could not clean ' + global.runtimePaths.target);
            }        
        }
    }
    
    // Delete all synced files if necessary
    if(!global.setup.build.app_node_cmd && alsoCleanSync){
        
        // Load the non release setup and execute the clean for it
        cleanSyncDests(JSON.parse(fm.readFile(global.runtimePaths.setupFile)));
                
        // Load the release setup and execute the clean for it
        if(fm.isFile(global.runtimePaths.setupReleaseFile)){
             
            cleanSyncDests(JSON.parse(fm.readFile(global.runtimePaths.setupReleaseFile)));
        }
    }
    
    cm.success("clean ok");
}


/**
 * Clean the configured remote sync ftp and or filesystem destinations
 */
let cleanSyncDests = function (setup) {
    
    if(setup.sync && setup.sync.type === "fileSystem" &&
       fm.isDirectory(setup.sync.destPath)){

        try{
            
            fm.deleteDirectory(setup.sync.destPath, false);
        
        }catch(e){
            
            cm.error("could not delete contents of " + setup.sync.destPath);
        }
     }
     
     if(setup.sync && (setup.sync.type === "ftp" || setup.sync.type === "sftp")){

         syncModule.deleteRemoteSyncFolder(setup);
     }
}