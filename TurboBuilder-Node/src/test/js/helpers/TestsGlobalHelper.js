#!/usr/bin/env node

'use strict';


const path = require('path');
const { TerminalManager } = require('turbodepot-node');


const terminalManager = new TerminalManager('', false);


/**
 * Helper that defines global methods to use with the turbobuilder tests
 * Helper modules are always executed once before all the tests run
 */
global.testsGlobalHelper = {


    /**
     * Execute the project main turbobuilder command via cmd with the specified arguments
     * TODO - replace all utils.exec calls on the project with this method
     * TODO - Terminal manager class should have the ability to define executable paths and run them when necessary. If this feature is
     *        implemented, this method may become unnecessary and be replaced with a terminalmanager exec call
     */
    execTurboBuilder: function(cmdArguments) {
    
        return terminalManager.exec('node "' + path.resolve(__dirname + '/../../../main/js/turbobuilder.js') + '" ' + cmdArguments).output;
    }
};



// TODO - add all the methods from cmd-parameter-test-utils.js