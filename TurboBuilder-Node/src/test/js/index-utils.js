#!/usr/bin/env node

'use strict';


/**
 * Methods that help with performing the tests
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
require('./../../main/js/globals');
const { FilesManager, ArrayUtils } = require('turbocommons-ts');
const { execSync } = require('child_process');
const console = require('./../../main/js/console');


let fm = new FilesManager(fs, os, path, process);
let executionDir = path.resolve('./');
let tempFolder = fm.createTempDirectory('turbobuilder-tests', false);
let pathToExecutable = 'node "' + path.resolve(__dirname + '/../../main/js/turbobuilder.js') + '"';


// We will delete the temporary folder when application exits, may it be due to a 
// success or an error
process.on('exit', () => {
    
    // Switch to the original execution dir to prevent temp folder from being locked
    this.switchToExecutionDir();
    
    this.assertFolderDelete(tempFolder);
});


/**
 * Used to execute a single test and notify to the console
 */
exports.test = function (testModule, testTitle, testCode) {

    console.log(testModule + ': ' + testTitle);
    
    testCode();
    
    console.success("ok");
};


/**
 * Move the work directory to the folder where the tests were first executed
 */
exports.switchToExecutionDir = function () {

    process.chdir(executionDir);
};


/**
 * Move the work directory to the temporary folder
 */
exports.switchToTemp = function () {
  
    process.chdir(tempFolder);
};


/**
 * Move the work directory to the specified folder inside the main temp folder.
 * If folder does not exist, it will be created
 */
exports.switchToDirInsideTemp = function (dirName) {
  
    let workDir = tempFolder + fm.dirSep() + dirName;

    fm.createDirectory(workDir);

    process.chdir(workDir);
    
    return workDir;
};


/**
 * Read the setup file on the specified folder and return it as a json object
 */
exports.readSetupFile = function (path) {
  
    return JSON.parse(fm.readFile(path + fm.dirSep() + global.fileNames.setup));
};


/**
 * Save the provided object to the setup file as a json string
 */
exports.saveToSetupFile = function (path, object) {
  
    if(!fm.saveFile(path + fm.dirSep() + global.fileNames.setup, JSON.stringify(object))){
        
        console.error("Could not save " + path + fm.dirSep() + global.fileNames.setup);
    }
};


/**
 * Execute the project via cmd with the specified options
 */
exports.exec = function (options) {
  
    execSync(pathToExecutable + ' ' + options, {stdio : 'pipe'});
};


/**
 * Verify that the condition is true
 */
exports.assertTrue = function (value) {

    if(!value){
    
        console.error('Assert true failed: ' + value);
    }
};


/**
 * Verify that the specified folder exists
 */
exports.assertIsFile = function (path) {

    if(!fm.isFile(path)){
    
        console.error('File does not exist: ' + path);
    }
};


/**
 * Verify that a file can be saved
 */
exports.assertSaveFile = function (path, data) {
    
    if(!fm.saveFile(path, data)){
    
        console.error('Could not save file: ' + path);
    }
};


/**
 * Verify that a folder can be created
 */
exports.assertCreateFolder = function (path) {

    if(!fm.createDirectory(path)){
    
        console.error('Could not create folder: ' + path);
    }
};


/**
 * Verify that the specified folder exists
 */
exports.assertIsFolder = function (path) {

    if(!fm.isDirectory(path)){
    
        console.error('Folder does not exist: ' + path);
    }
};


/**
 * Verify that the specified folder is empty
 */
exports.assertFolderEmpty = function (path) {

    if(!fm.isDirectoryEmpty(path)){
    
        console.error('Folder is not empty: ' + path);
    }
};


/**
 * Delete the specified folder and assert that it has been correctly deleted
 */
exports.assertFolderDelete = function (path) {

    this.assertIsFolder(path);
    
    if(!fm.deleteDirectory(path)){
        
        console.error('Could not delete folder: ' + path);
    }
    
    if(fm.isDirectory(path)){
    
        console.error('Folder was not deleted: ' + path);
    }
};


/**
 * Verify that executing a project cmd execution contains the expected results
 */
exports.assertExecContains = function (options, errorMessage, expected = null, notExpected = null) {

    try{
        
        let execResult = execSync(pathToExecutable + ' ' + options, {stdio : 'pipe'});

        if(expected !== null){
            
            if(ArrayUtils.isArray(expected)){
                
                for (let ex of expected) {
                    
                    if(execResult.toString().indexOf(ex) < 0){

                        console.error(errorMessage + "\nexpected:" + ex + "\n" + execResult.toString());
                    }
                }
                
            }else{
            
                if(execResult.toString().indexOf(expected) < 0){

                    console.error(errorMessage + "\nexpected:" + expected + "\n" + execResult.toString());
                }
            }
        }
        
        if(notExpected !== null){
            
            if(ArrayUtils.isArray(notExpected)){
                
                for (let ex of notExpected) {
                    
                    if(execResult.toString().indexOf(ex) >= 0){

                        console.error(errorMessage + "\nNOT expected:" + ex + "\n" + execResult.toString());
                    }
                }
                
            }else{
            
                if(execResult.toString().indexOf(notExpected) >= 0){

                    console.error(errorMessage + "\nNOT expected:" + notExpected + "\n" + execResult.toString());
                }
            }
        }
        
        
    }catch(e){
        
        console.error(errorMessage + "\n" + e.stdout + e.toString());
    }    
};


/**
 * Verify that executing a project cmd execution fails with the expected message
 */
exports.assertExecFails = function (options, expectedError, errorMessage) {
  
    try{
    
        let execResult = execSync(pathToExecutable + ' ' + options, {stdio : 'pipe'});
        
        console.error(errorMessage + "\n" + pathToExecutable + ' ' + options + " did not fail:\n" + execResult.toString());
        
    }catch(e){
        
        // Everything ok, the exec failed, but message must match
        if(e.stdout.indexOf(expectedError) < 0){

            console.error(errorMessage + "\nExpected: " + expectedError +"\nReceived: " + e.stdout);
        }
    }
};