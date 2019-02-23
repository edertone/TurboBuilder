'use strict';

/**
 * this module contains all the code related to the sync process
 */


const console = require('./console.js');
const buildModule = require('./build');
const setupModule = require('./setup');
const { StringUtils, FilesManager } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Execute the sync process
 */
exports.execute = function (verbose = true) {
    
    if(verbose){
        
        console.log("\nsync start");
    }
      
    if(verbose || global.setup.sync.runAfterBuild === true){
    
        if(global.setup.sync.type === "fileSystem"){
            
            syncFileSystem();
        }

        if(global.setup.sync.type === "ftp"){
            
            syncFtp();
        }
    }
}


/**
 * Calculate the path from where the files will be synced depending on if we are running a build or a release
 */
let calculateSourcePath = function () {
    
    let result = global.runtimePaths.root + fm.dirSep() + 'target' + fm.dirSep();
    
    if(global.isRelease){
        
        result += setupModule.getProjectName() + "-" + setupModule.getProjectRepoSemVer(false)
            + fm.dirSep() + global.setup.sync.sourcePath;
    
    } else {
        
        result += setupModule.getProjectName() + fm.dirSep() + global.setup.sync.sourcePath;
    }
    
    return StringUtils.formatPath(result, fm.dirSep());
}


/**
 * Execute the project sync via file system
 */
let syncFileSystem = function () {
    
    let sourcePath = calculateSourcePath();
    
    if(!fm.isDirectory(sourcePath)){
        
        console.error('Source path does not exist: ' + sourcePath);
    }
    
    if(!fm.isDirectory(global.setup.sync.destPath)){
        
        console.error('Destination path does not exist: ' + global.setup.sync.destPath);
    }
    
    // TODO - apply excludes option
    
    if(global.setup.sync.deleteDestPathContents &&
       !fm.deleteDirectory(global.setup.sync.destPath, false)){
        
        console.error('Could not delete destination: ' + global.setup.sync.destPath);
    }
    
    if(!fm.isDirectoryEmpty(global.setup.sync.destPath)){
        
        console.error('Destination path is not empty: ' + global.setup.sync.destPath);
    }
    
    fm.copyDirectory(sourcePath, global.setup.sync.destPath);
    
    console.success('sync ok to fs: ' + global.setup.sync.destPath);
}


/**
 * Execute the project sync via ftp
 */
let syncFtp = function () {
    
    buildModule.checkWinSCPAvailable();
    
    let winscpExec = 'winscp /command';
    let sourcePath = calculateSourcePath();
    
    if(!fm.isDirectory(sourcePath)){
        
        console.error('Folder does not exist: ' + sourcePath);
    }
    
    // TODO - apply excludes option
    
    winscpExec += ' "open ftp://' + global.setup.sync.user + ':' + global.setup.sync.psw + '@' + global.setup.sync.host + '/"';
    winscpExec += ' "synchronize remote -delete ""' + sourcePath + '"" ' + global.setup.sync.remotePath + '"';
    winscpExec += ' "exit"';
    
    if(!console.exec(winscpExec, '', true)){
        
        console.error('Sync errors');
    }

    console.success('sync ok to ftp: ' + global.setup.sync.host);
}