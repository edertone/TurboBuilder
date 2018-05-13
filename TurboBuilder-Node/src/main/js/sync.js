'use strict';

/**
 * this module contains all the code related to the sync process
 */


const console = require('./console.js');
const setupModule = require('./setup');
const { FilesManager } = require('turbocommons-ts');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Execute the sync process
 */
exports.execute = function () {
    
    setupModule.checkWinSCPAvailable();
    
    console.log("\nsync start");
    
    for (let syncSetup of global.setup.sync) {
        
        if(syncSetup.type === "FTP"){
            
            let localPath = '';
            let winscpExec = 'winscp /command';
            
            if(syncSetup.localRoot === 'build'){
                
                localPath = global.runtimePaths.targetDevRoot + fm.dirSep() + syncSetup.localPath;
            }
            
            winscpExec += ' "open ftp://' + syncSetup.user + ':' + syncSetup.psw + '@' + syncSetup.host + '/"';
            winscpExec += ' "synchronize remote -delete ""' + localPath + '"" ' + syncSetup.remotePath + '"';
            winscpExec += ' "exit"';
            
            console.exec(winscpExec, '', true);
        }
    }
    
    console.success('sync ok');
}