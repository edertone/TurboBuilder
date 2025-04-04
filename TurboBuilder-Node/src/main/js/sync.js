'use strict';

/**
 * this module contains all the code related to the sync process
 */


const appsModule = require('./apps');
const setupModule = require('./setup');
const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { ConsoleManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');


let fm = new FilesManager();
const cm = new ConsoleManager();
const terminalManager = new TerminalManager();


/**
 * Execute the sync process
 */
exports.execute = function (verbose = true) {
    
    if(verbose){
        
        cm.text("\nsync start");
    }
      
    if(verbose || global.setup.sync.runAfterBuild === true){
    
        if(global.setup?.sync?.type === "fileSystem"){
            
            syncFileSystem();
        }

        if(global.setup?.sync?.type === "ftp" || global.setup?.sync?.type === "sftp"){
            
            syncFtpSftp();
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
    
    // Append the turbosite baseUrl if it exists (only on site_php and server_php project types)
    result += fm.dirSep() + setupModule.getTurboSiteBaseUrl();
            
    return StringUtils.formatPath(result, fm.dirSep());
}


/**
 * Execute the project sync via file system
 */
let syncFileSystem = function () {

    let sourcePath = calculateSourcePath();
    
    if(!fm.isDirectory(sourcePath)){
        
        cm.error('Source filesystem sync path does not exist: ' + sourcePath);
    }
        
    if(!fm.isDirectory(global.setup.sync.destPath)){
        
        cm.error('Destination filesystem sync path does not exist: ' + global.setup.sync.destPath);
    }
    
    // TODO - apply excludes option
    
    if(global.setup.sync.deleteDestPathContents){
        
        try{
            
            fm.deleteDirectory(global.setup.sync.destPath, false);
            
        }catch(e) {
            
            cm.error('Could not delete destination: ' + global.setup.sync.destPath + '\n' + e.toString());
        }        
    }
    
    if(!fm.isDirectoryEmpty(global.setup.sync.destPath)){
        
        cm.error('Destination path is not empty: ' + global.setup.sync.destPath);
    }
    
    fm.copyDirectory(sourcePath, global.setup.sync.destPath);
    
    cm.success('sync ok to fs: ' + global.setup.sync.destPath);
}


/**
 * Execute the project sync via ftp or via sftp
 */
let syncFtpSftp = function () {
    
    appsModule.checkWinSCPAvailable();
    
    let winscpExec = 'winscp /command';
    let sourcePath = calculateSourcePath();
    
    if(!fm.isDirectory(sourcePath)){
        
        cm.error('Folder does not exist: ' + sourcePath);
    }
    
    validateEnviromentVars();
    
    cm.text(`\n${global.setup.sync.type.toUpperCase()} connect to ${global.setup.sync.host} with user ${process.env[global.setup.sync.user]}`);
    cm.text(`Remote path: ${global.setup.sync.remotePath}`);
    cm.text(`Starting ${global.setup.sync.type} SYNC! it may take some time, Please wait...`);
    
    // Encode the password to avoid issues with special characters
    const encodedPassword = encodeURIComponent(process.env[global.setup.sync.psw]);
    
    // Build the connection string
    const connectionString = `${global.setup.sync.type}://${process.env[global.setup.sync.user]}:${encodedPassword}@${setup.sync.host}/`;

    // Construct the WinSCP commands
    winscpExec += ` "open ${connectionString}"`; 
    winscpExec += ' "synchronize remote -delete ""' + sourcePath + '"" ' + global.setup.sync.remotePath + '"';
    winscpExec += ' "exit"';
    
    let terminalResult = terminalManager.exec(winscpExec, false);
        
    if(terminalResult.failed){
        
        cm.error('Sync errors:\n' + terminalResult.output);
    }

    cm.success(`sync ok to ${global.setup.sync.type}: ${global.setup.sync.host}`);
}


/**
 * Auxiliary method to verify that the enviroment variables are correctly set for the remote connections (FTP or SFTP)
 */
let validateEnviromentVars = function () {
    
    if(!process.env[global.setup.sync.user]){
        
        cm.error('Could not find environment variable for ' + global.setup.sync.type + ' user: ' + global.setup.sync.user);
    }
    
    if(!process.env[global.setup.sync.psw]){
        
        cm.error('Could not find environment variable for ' + global.setup.sync.type + ' password: ' + global.setup.sync.psw);
    }
}


/**
 * Clean the configured remote sync ftp or sftp folder
 */
exports.deleteRemoteSyncFolder = function (setup) {
    
    appsModule.checkWinSCPAvailable();
    
    let winscpExec = 'winscp /command';
    
    validateEnviromentVars();
    
    cm.text(`\n${global.setup.sync.type.toUpperCase()} connect to ${global.setup.sync.host} with user ${process.env[global.setup.sync.user]}`);
    cm.text(`Remote path: ${global.setup.sync.remotePath}`);
    cm.text(`Starting ${global.setup.sync.type} CLEAN! it may take some time, Please wait...`);
    
    // Encode the password to avoid issues with special characters
    const encodedPassword = encodeURIComponent(process.env[global.setup.sync.psw]);
    
    // Build the connection string
    const connectionString = `${global.setup.sync.type}://${process.env[global.setup.sync.user]}:${encodedPassword}@${setup.sync.host}/`;

    // Construct the WinSCP commands
    winscpExec += ` "open ${connectionString}"`; 
    winscpExec += ` "rm ${setup.sync.remotePath}/*.*"`;
    winscpExec += ` "exit"`;
    
    let terminalResult = terminalManager.exec(winscpExec, false);
    
    if(terminalResult.failed){
        
        cm.error('Remote clean errors:\n' + terminalResult.output);
    }

    cm.success(`cleaned remote ftp: ${global.setup.sync.host} ${setup.sync.remotePath}`);
}