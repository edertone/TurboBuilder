'use strict';

/**
 * this module contains all the code related to the build process
 */


const { FilesManager, StringUtils, ObjectUtils } = require('turbocommons-ts');
const { execSync } = require('child_process');
const console = require('./console');
const setupModule = require('./setup');
const validateModule = require('./validate');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * We will delete the unpacked src files when application exits, may it be due to a
 * success or an error
 */
process.on('exit', () => {

    if(global.setup !== null &&
            !global.setup.build.keepUnpackedSrcFiles){
        
        this.removeUnpackedSrcFiles(global.runtimePaths.target + fm.dirSep() + this.getBuildRelativePath());
    }
});


/**
 * Execute the build process
 */
exports.execute = function () {
    
    console.log("\nbuild start: " + setupModule.detectProjectTypeFromSetup(global.setup));
    
    let buildFullPath = global.runtimePaths.target + fm.dirSep() + this.getBuildRelativePath();
    
    // Delete all files inside the target/projectName folder
    fm.deleteDirectory(buildFullPath);
    
    // Copy all the src main files to the target dev build folder
    this.copyMainFiles(buildFullPath);
    
    if(global.setup.validate.runBeforeBuild){
        
        validateModule.execute(false);
    }
    
    // Perform custom build depending on project type
    if(global.setup.build.site_php){
        
        this.buildSitePhp(buildFullPath);
    }
    
    if(global.setup.build.lib_php){
        
        this.buildLibPhp(buildFullPath);
    }
    
    if(global.setup.build.lib_ts){
    
        this.buildLibTs(buildFullPath);
    }
    
    console.success('build ok');
};


/**
 * Gets the path relative to project target where current build version is generated
 */
exports.getBuildRelativePath = function () {
    
    return global.runtimePaths.projectName;    
}


/**
 * Copy all the project src/main files to the target folder. Any unwanted files/folders are excluded
 */
exports.copyMainFiles = function (destPath) {
    
    // If source file is empty, alert the user
    if(!fm.isDirectory(global.runtimePaths.main) ||
       fm.findDirectoryItems(global.runtimePaths.main, /.*/i, 'relative', 'files').length === 0){
        
        console.error('no files to build');
    }
    
    let destMain = destPath + fm.dirSep() + 'main';
    
    // Copy the main folder to the target
    fm.createDirectory(destMain, true);
    
    // Delete all the following files: thumbs.db .svn .git
    // TODO let filesToDelete = fm.findDirectoryItems(global.runtimePaths.main, /^(?!.*(thumbs\.db|\.svn|\.git)$)/i, 'absolute', 'files');
    
    fm.copyDirectory(global.runtimePaths.main, destMain);
    
    // TODO - Replace the string @@package-build-version@@ on all the files with the real build version number
    
    console.success('copy main files ok');
}


/**
 * Execute the site_php build process to the specified dest folder
 */
exports.buildSitePhp = function (destPath) {
    
    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    let destDist = destPath + sep + 'dist';
    let destSite = destDist + sep + 'site';
    
    // Create the dist and site folders if not exists
    if(!fm.isDirectory(destDist) && !fm.createDirectory(destDist)){
        
        console.error('Could not create ' + destDist);
    }
    
    if(!fm.createDirectory(destSite)){
        
        console.error('Could not create ' + destSite);
    }
    
    fm.copyDirectory(destMain, destSite);
    
    // Move htaccess file from site to dist
    fm.copyFile(destSite + sep + 'htaccess.txt', destDist + sep + '.htaccess');
    fm.deleteFile(destSite + sep + 'htaccess.txt');
    
    // Generate a random hash to avoid browser caches
    let turboSiteSetup = JSON.parse(fm.readFile(destSite + sep + 'turbosite.json'));
    
    turboSiteSetup.cacheHash = StringUtils.generateRandom(15, 15);
    
    fm.saveFile(destSite + sep + 'turbosite.json', JSON.stringify(turboSiteSetup, null, 4));
    
    // Create global css file
    fm.saveFile(destSite + sep + 'glob-' + turboSiteSetup.cacheHash +'.css',
            this.mergeFilesFromArray(turboSiteSetup.globalCss, destSite, true));
    
    // Create global Js file
    fm.saveFile(destSite + sep + 'glob-' + turboSiteSetup.cacheHash +'.js',
            this.mergeFilesFromArray(turboSiteSetup.globalJs, destSite, true));
    
    // 2 - merge components
      
    // Create view css and js files
    // TODO
}


/**
 * Execute the lib_php build process to the specified dest folder
 */
exports.buildLibPhp = function (destPath) {
    
    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    let destDist = destPath + sep + 'dist';
    
    this.checkPhpAvailable();
    
    // autoloader.php must exist on src/main/php/ for the phar to be correctly generated
    let autoLoaderPath = global.runtimePaths.main + sep + 'php' + sep + 'autoLoader.php';
    
    if(!fm.isFile(autoLoaderPath)){
        
        console.error(autoLoaderPath + " not found.\nThis is required to create a phar that loads classes automatically");
    }
    
    // Define the contents for the stub file that will be autoexecuted when the phar file is included
    let pharName = global.runtimePaths.projectName + "-" + setupModule.getProjectRepoSemVer() + '.phar';
    
    let phpStubFile = "<?php Phar::mapPhar(); include \\'phar://" + pharName + "/php/autoloader.php\\'; __HALT_COMPILER(); ?>";
    
    // Create the dist folder if not exists
    if(!fm.isDirectory(destDist) && !fm.createDirectory(destDist)){
        
        console.error('Could not create ' + destDist);
    }
    
    // Create the phar using the current project name
    let phpExecCommand = 'php -d display_errors -r';
    
    phpExecCommand += ' "';
    phpExecCommand += " $p = new Phar('" + destDist + sep + pharName + "', FilesystemIterator::CURRENT_AS_FILEINFO | FilesystemIterator::KEY_AS_FILENAME, '" + pharName + "');";
    phpExecCommand += " $p->startBuffering();";
    phpExecCommand += " $p->setStub('" + phpStubFile + "');";
    phpExecCommand += " $p->buildFromDirectory('" + destMain + "');";
    phpExecCommand += " $p->compressFiles(Phar::GZ); $p->stopBuffering();";
    phpExecCommand += '"';
    
    console.exec(phpExecCommand);
}


/**
 * Execute the lib_ts build process to the specified dest folder
 */
exports.buildLibTs = function (destPath) {
    
    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    let destDist = destPath + sep + 'dist';
    let tsConfig = destMain + sep + 'ts' + sep + 'tsconfig.json';
    
    // Create a default tsconfig file if there's no specific one
    if (!fm.isFile(tsConfig) &&
        !fm.saveFile(tsConfig, '{"compilerOptions":{"target": "es5"}}')) {
        
        console.error('Could not create ' + tsConfig);
    }
    
    for (let target of global.setup.build.lib_ts.targets) {
    
        let isMergedFile = target.hasOwnProperty('mergedFile') && !StringUtils.isEmpty(target.mergedFile);
        
        let compiledFolder = destDist + sep + target.folder + (isMergedFile ? sep + 'tmp' : '');

        let tsExecution = global.installationPaths.typeScriptBin;
        
        tsExecution += global.setup.build.lib_ts.strict ? ' --strict' : '';
        tsExecution += global.setup.build.lib_ts.declaration ? ' --declaration' : '';
        tsExecution += global.setup.build.lib_ts.sourceMap ? ' --sourceMap' : '';

        tsExecution += ' --alwaysStrict';             
        tsExecution += ' --target ' + target.jsTarget;
        tsExecution += ' --outDir "' + compiledFolder + '"';
        tsExecution += ' --module commonjs';
        tsExecution += ' --rootDir "' + destMain + sep + 'ts"';      
        tsExecution += ' --project "' + destMain + sep + 'ts"';                          
        console.exec(tsExecution);

        // Check if the target requires a merged JS file or not
        if(isMergedFile){
            
            let mergedFileName = target.mergedFile + '.js';
            
            // Generate via webpack the merged JS file for the current target       
            let webPackExecution = global.installationPaths.webPackBin;
             
            webPackExecution += ' "' + compiledFolder + sep + 'index.js"';
            webPackExecution += ' "' + destDist + sep + target.folder + sep + mergedFileName + '"';
            webPackExecution += ' --output-library ' + target.globalVar;                            
            
            if(global.setup.build.lib_ts.sourceMap){
                
                fm.saveFile(compiledFolder + sep + 'webpack.config.js', "module.exports = {devtool: 'source-map'};");
                
                webPackExecution += ' --config "' + compiledFolder + sep + 'webpack.config.js"';     
            }

            console.exec(webPackExecution, 'Webpack ' + target.jsTarget + ' ok');
            
            fm.deleteDirectory(compiledFolder);   
        }
    }
}


/**
 * Join all the files from the specified array and get a string with the result
 */
exports.mergeFilesFromArray = function (array, basePath, deleteFiles = false) {
    
    let result = '';
        
    for (let file of array) {
        
        result += fm.readFile(basePath + fm.dirSep() + file) + "\n\n";
    }
    
    if(deleteFiles){
        
        for (let file of array) {
            
            fm.deleteFile(basePath + fm.dirSep() + file);
        }
    }
    
    return result;
}


/**
 * Delete all the src main files that exist on target folder
 */
exports.removeUnpackedSrcFiles = function (destPath) {

    let destMain = destPath + fm.dirSep() + 'main';
    
    // Delete the files
    if(fm.isDirectory(destMain) && !fm.deleteDirectory(destMain)){
        
        console.error('Could not delete unpacked src files from ' + destMain);
    }
}


let isWinSCPAvailable = false;


/**
 * Check if the WinSCP cmd executable is available or not on the system
 */
exports.checkWinSCPAvailable = function () {

    if(!isWinSCPAvailable){
        
        try{
            
            execSync('winscp /help', {stdio : 'pipe'});
            
            isWinSCPAvailable = true;
            
        }catch(e){

            console.error('Could not find winscp cmd executable. Please install winscp and make sure is available globally via cmd (add to PATH enviroment variable) to perform sync operations');
        }
    }
}


let isGitAvailable = false;


/**
 * Check if the git cmd executable is available or not on the system
 */
exports.checkGitAvailable = function () {

    if(!isGitAvailable){
        
        try{
            
            execSync('git --version', {stdio : 'pipe'});
            
            isGitAvailable = true;
            
        }catch(e){

            console.error('Could not find Git cmd executable. Please install git on your system to create git changelogs');
        }
    }
}


let isPhpAvailable = false;


/**
 * Check if the php cmd executable is available or not on the system
 */
exports.checkPhpAvailable = function () {

    if(!isPhpAvailable){
        
        try{
            
            execSync('php -v', {stdio : 'pipe'});
            
            isPhpAvailable = true;
            
        }catch(e){

            console.error('Could not find Php cmd executable. Please install php and make sure is available globally via cmd (add to enviroment variables).');
        }
    }
}