/**
 * this module contains all the code related to the setup data
 */


var fs = require('fs');
const { execSync } = require('child_process');
const { StringUtils } = require('turbocommons-ts');


/**
 * Checks that all the required cmd tools are available and can be executed
 */
exports.verifyToolsAvailable = function () {

    // TODO
}


/**
 * Read the xml setup file and store all the data to a global variable
 */
exports.loadSetupFromXml = function () {

    this.verifyToolsAvailable();
    
    if (!fs.existsSync('./' + global.SETUP_FILE_NAME)) {
    
        console.log(global.SETUP_FILE_NAME + ' setup file not found');
        
        // Terminate application with error code
        process.exit(1);
    }
    
    return fs.readFileSync('./' + global.SETUP_FILE_NAME, 'utf8');
};


/**
 * Get the latest tag if defined on GIT and not specified on TurboBuilder.xml
 */
exports.getLatestGitTag = function () {
    
    try{
        
        let execResult = execSync('git describe --abbrev=0 --tags', {stdio : 'pipe'});
        
        return StringUtils.trim(execResult.toString());
        
    }catch(e){

        return '0';
    }    
}