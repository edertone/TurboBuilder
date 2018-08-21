'use strict';

/**
 * this module contains all the code related to the sync process
 */


const console = require('./console.js');
const buildModule = require('./build');
const { StringUtils, FilesManager } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Execute the sync process
 */
exports.execute = function (verbose = true) {
    
    if(!global.setup.sync || global.setup.sync.length <= 0){
       
        console.error("No sync setup defined on " + global.fileNames.setup);
    }
    
    if(verbose){
        
        console.log("\nsync start");
    }
    
    for (let syncSetup of global.setup.sync) {
        
        if(verbose || syncSetup.runAfterBuild === true){
        
            if(syncSetup.type === "fileSystem"){
                
                syncFileSystem(syncSetup);
            }
    
            if(syncSetup.type === "ftp"){
                
                syncFtp(syncSetup);
            }
        }
    }
}


/**
 * True if there's any sync element on the global setup that has an enabled value for
 * runAfterBuild
 */
exports.isAnyRunAfterBuildEnabled = function () {
    
    for (let syncSetupItem of global.setup.sync) {
        
        if(syncSetupItem.runAfterBuild){
            
            return true;
        }
    }
    
    return false;
}


/**
 * Execute the project sync via file system
 */
let calculateSourcePath = function (syncSetup) {
    
    let result = global.runtimePaths.root + fm.dirSep() + syncSetup.sourcePath;
    
    return StringUtils.replace(result, ['$dev', '$prod'], [global.runtimePaths.projectName, 'TODO']);
}


/**
 * Execute the project sync via file system
 */
let syncFileSystem = function (syncSetup) {
    
    let sourcePath = calculateSourcePath(syncSetup);
    
    if(!fm.isDirectory(sourcePath)){
        
        console.error('Source path does not exist: ' + sourcePath);
    }
    
    if(!fm.isDirectory(syncSetup.destPath)){
        
        console.error('Destination path does not exist: ' + syncSetup.destPath);
    }
    
    // TODO - apply excludes option
    
    if(syncSetup.deleteDestPathContents &&
       !fm.deleteDirectory(syncSetup.destPath, false)){
        
        console.error('Could not delete destination: ' + syncSetup.destPath);
    }
    
    if(!fm.isDirectoryEmpty(syncSetup.destPath)){
        
        console.error('Destination path is not empty: ' + syncSetup.destPath);
    }
    
    fm.copyDirectory(sourcePath, syncSetup.destPath);
    
    console.success('sync ok to fs: ' + syncSetup.destPath);
}


/**
 * Execute the project sync via ftp
 */
let syncFtp = function (syncSetup) {
    
    buildModule.checkWinSCPAvailable();
    
    let winscpExec = 'winscp /command';
    let sourcePath = calculateSourcePath(syncSetup);
    
    if(!fm.isDirectory(sourcePath)){
        
        console.error('Folder does not exist: ' + sourcePath);
    }
    
    // TODO - apply excludes option
    
    winscpExec += ' "open ftp://' + syncSetup.user + ':' + syncSetup.psw + '@' + syncSetup.host + '/"';
    winscpExec += ' "synchronize remote -delete ""' + sourcePath + '"" ' + syncSetup.remotePath + '"';
    winscpExec += ' "exit"';
    
    if(!console.exec(winscpExec, '', true)){
        
        console.error('Sync errors');
    }

    console.success('sync ok to ftp: ' + syncSetup.host);
}