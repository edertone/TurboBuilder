#!/usr/bin/env node

'use strict';


const path = require('path');
const { FilesManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');


const filesManager = new FilesManager();
const terminalManager = new TerminalManager('', false);


/**
 * Helper that defines global methods to use with the turbobuilder tests
 * Helper modules are always executed once before all the tests run
 */
global.testsGlobalHelper = {


    /**
     * Execute the project main turbobuilder command via cmd with the specified arguments
     * TODO - Terminal manager class should have the ability to define executable paths and run them when necessary. If this feature is
     *        implemented, this method may become unnecessary and be replaced with a terminalmanager exec call
     */
    execTbCmd: function(cmdArguments) {
    
        return terminalManager.exec('node "' + path.resolve(__dirname + '/../../../main/js/turbobuilder.js') + '" ' + cmdArguments).output;
    },
    
    
    /**
     * Read the specified setup file from the current work dir and return it as a json object
     */
    readSetupFile: function(fileName = 'turbobuilder.json') {
    
        return JSON.parse(filesManager.readFile('.' + filesManager.dirSep() + fileName));
    },
    
    
    /**
     * Save the provided object to the setup file on the current work dir as a json string
     */
    saveToSetupFile: function(object, fileName = 'turbobuilder.json') {
    
        return filesManager.saveFile('.' + filesManager.dirSep() + fileName, JSON.stringify(object));
    }
};