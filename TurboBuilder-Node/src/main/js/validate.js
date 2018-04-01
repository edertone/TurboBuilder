'use strict';

/**
 * this module contains all the code related to the project validation
 */


const { StringUtils } = require('turbocommons-ts');
const path = require('path');
var fs = require('fs');


/**
 * Aux method that validates that a given list of files exists
 */
let allFilesExist = function (basePath, files) {
    
    for(var i = 0; i < files.length; i++){
        
        if (!fs.existsSync(path.resolve(basePath + files[i]))) {
            
            return path.resolve(basePath + files[i]);
        }
    }
    
    return '';
}

/**
 * Perform all the validation tasks
 */
exports.execute = function () {
    
//    let tmp = allFilesExist(global.RUNTIME_PATH,
//            ["src/main", "src/test", "TurboBuilder.xml", "TurboBuilder-OneTime.properties"]);
//    
//    if(allFilesExist(global.RUNTIME_PATH,
//            ["src/main", "src/test", "TurboBuilder.xml", "TurboBuilder-OneTime.properties"]) !== ''){
//        
//        console.log('File does not exist ' + tmp);
//    }    
}