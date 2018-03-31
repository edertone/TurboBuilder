/**
 * this module contains all the code related to the setup data
 */


var fs = require('fs');
const { COPYFILE_EXCL } = fs.constants;
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


/**
 * Create a default turbocommons.xml setup file on the current folder
 */
exports.createSetup = function () {
    
    let setupPath = __dirname + '/../resources/turbobuilder.xml';
    
    if (!fs.existsSync(setupPath)) {
        
        console.log(setupPath + ' file not found');
        
        process.exit(1);
    }
    
    try{
        
        fs.copyFileSync(setupPath,'./' + global.SETUP_FILE_NAME, COPYFILE_EXCL);
        
        console.log('Created ' + global.SETUP_FILE_NAME + ' file');
        
    }catch(e){
    
        console.log('Error creating ' + global.SETUP_FILE_NAME + ' file. Does it already exist?');
    }    
    
    process.exit(0);
}