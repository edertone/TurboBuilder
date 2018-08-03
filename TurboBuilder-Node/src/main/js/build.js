'use strict';

/**
 * this module contains all the code related to the build process
 */


const { FilesManager, StringUtils, ObjectUtils } = require('turbocommons-ts');
const { execSync } = require('child_process');
const console = require('./console');
const setupModule = require('./setup');
const validateModule = require('./validate');
const syncModule = require('./sync');
const sass = require('node-sass');
const sharp = require('sharp');


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
    
    // Check if any of the sync elements is configured to be executed after build
    if(syncModule.isAnyRunAfterBuildEnabled()){
        
        syncModule.execute(false);
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
    let turboSiteSetup = JSON.parse(fm.readFile(global.runtimePaths.root + sep + 'turbosite.json'));
    
    turboSiteSetup.cacheHash = StringUtils.generateRandom(15, 15);
    
    fm.saveFile(destSite + sep + 'turbosite.json', JSON.stringify(turboSiteSetup, null, 4));
    
    // Process all sass scss files to css
    let scssFiles = fm.findDirectoryItems(destSite, /^.*\.scss$/i, 'absolute', 'files');
    
    for (let scssFile of scssFiles) {

        let scssCode = sass.renderSync({
            file: scssFile
          });
        
        fm.saveFile(StringUtils.replace(scssFile, '.scss', '.css'), scssCode.css);
    }
    
    for (let scssFile of scssFiles) {
    
        fm.deleteFile(scssFile);
    }
    
    // Generate all missing favicons
    let destFaviconsPath = destSite + sep + 'resources' + sep + 'favicons';
    let faviconFiles = fm.findDirectoryItems(destFaviconsPath, /^.*\.png$/i, 'name', 'files');
    
    // If no favicons are specified, launch a warning
    if(faviconFiles.length <= 0){
        
        console.warning("Warning: No favicons specified");
    }
    
    // List of expected favicon files and sizes, sorted from biggest to smallest
    let faviconExpectedFiles = [
            {name: "196x196.png", w: 196, h: 196},
            {name: "apple-touch-icon-180x180.png", w: 180, h: 180},
            {name: "apple-touch-icon-precomposed.png", w: 152, h: 152},
            {name: "apple-touch-icon.png", w: 152, h: 152},
            {name: "apple-touch-icon-152x152.png", w: 152, h: 152},
            {name: "apple-touch-icon-144x144.png", w: 144, h: 144},
            {name: "128x128.png", w: 128, h: 128},
            {name: "apple-touch-icon-114x114.png", w: 114, h: 114},
            {name: "96x96.png", w: 96, h: 96},
            {name: "apple-touch-icon-76x76.png", w: 76, h: 76},
            {name: "apple-touch-icon-57x57.png", w: 57, h: 57},
            {name: "32x32.png", w: 32, h: 32},
            {name: "16x16.png", w: 16, h: 16},
        ];
    
    // Make sure all favicons on the resources folder match any of the expected ones
    for (let faviconFile of faviconFiles) {
        
        let fileNameFound = false;
        
        for (let faviconExpectedFile of faviconExpectedFiles) {

            if(faviconFile === faviconExpectedFile.name){
                
                fileNameFound = true;
                
                break;
            }
        }
        
        if(!fileNameFound){
            
            console.error('Unexpected favicon name: ' + faviconFile);
        }
    }
    
    // Aux method to add the cache hash to a file and rename it
    let renameFileToAddHash = (filePath) => {
        
        let filePathWithHash = filePath.replace(StringUtils.getPathElement(filePath),
                StringUtils.getPathElementWithoutExt(filePath) + '-' + turboSiteSetup.cacheHash + '.' + StringUtils.getPathExtension(filePath));
        
        if(!fm.renameFile(filePath, filePathWithHash)){
            
            console.error('Could not rename file with cache hash: ' + filePathWithHash);
        }
        
        return StringUtils.getPathElement(filePathWithHash);
    }
    
    // Find the biggest favicon that is provided on the project based on the list of expected ones
    let biggestFound = '';
    let biggestFoundWithHash = '';
    
    for (let faviconExpectedFile of faviconExpectedFiles) {

        if(faviconFiles.indexOf(faviconExpectedFile.name) >= 0){
            
            biggestFound = faviconExpectedFile.name;
            biggestFoundWithHash = renameFileToAddHash(destFaviconsPath + sep + faviconExpectedFile.name);
        }
    }
    
    // Generate all missing favicon images with the sharp image processing library
    if(biggestFound !== ''){
            
        for (let faviconExpectedFile of faviconExpectedFiles) {
    
            if(faviconFiles.indexOf(faviconExpectedFile.name) < 0){
                
                // Apple touch icons are placed at the root of the site cause they are autodetected by apple devices
                if(faviconExpectedFile.name.indexOf("apple-touch-") === 0){
                    
                    // Use the amazing sharp lib to resize the image to the missing width and height
                    sharp(destFaviconsPath + sep + biggestFoundWithHash)
                        .resize(faviconExpectedFile.w, faviconExpectedFile.h)
                        .toFile(destSite + sep + faviconExpectedFile.name, function(err) {
                            
                            if(err || !fm.isFile(destSite + sep + faviconExpectedFile.name)) {
                                
                                console.error('Could not generate favicon : ' + destSite + sep + faviconExpectedFile.name + "\n" + err);
                            }
                        });
                    
                    // Hard block till we are sure the file is created
                    blockingSleepTill(() => {return fm.isFile(destSite + sep + faviconExpectedFile.name);}, 60000,
                        'Could not generate favicon : ' + destSite + sep + faviconExpectedFile.name);
                                        
                }else{
                    
                    // Add the hash to the expected favicon
                    let faviconExpectedFileWithHash = StringUtils.getPathElementWithoutExt(faviconExpectedFile.name) + '-' + turboSiteSetup.cacheHash
                        + '.' + StringUtils.getPathExtension(faviconExpectedFile.name);
                    
                    sharp(destFaviconsPath + sep + biggestFoundWithHash)
                        .resize(faviconExpectedFile.w, faviconExpectedFile.h)
                        .toFile(destFaviconsPath + sep + faviconExpectedFileWithHash, function(err) {
                            
                            if(err || !fm.isFile(destFaviconsPath + sep + faviconExpectedFileWithHash)) {
                                
                                console.error('Could not generate favicon: ' + destFaviconsPath + sep + faviconExpectedFile.name + "\n" + err);
                            }
                        });
                    
                    // Hard block till we are sure the file is created
                    blockingSleepTill(() => {return fm.isFile(destFaviconsPath + sep + faviconExpectedFileWithHash);}, 60000,
                        'Could not generate favicon: ' + destFaviconsPath + sep + faviconExpectedFile.name);
                }
            
            }else{
                
                if(biggestFound !== faviconExpectedFile.name){
                
                    renameFileToAddHash(destFaviconsPath + sep + faviconExpectedFile.name);
                }
            }
        }
    }
             
    // Create global css file
    fm.saveFile(destSite + sep + 'glob-' + turboSiteSetup.cacheHash +'.css',
            mergeFilesFromArray(turboSiteSetup.globalCss, destSite, true));
    
    // Create global Js file
    fm.saveFile(destSite + sep + 'glob-' + turboSiteSetup.cacheHash +'.js',
            mergeFilesFromArray(turboSiteSetup.globalJs, destSite, true));
    
    // Generate all the components css and js merged files
    mergeCssAndJsByFolder(destSite + sep + 'view' + sep + 'components', destSite, turboSiteSetup.cacheHash, 'comp-view-components-');
    
    // Generate all the views css and js merged files
    mergeCssAndJsByFolder(destSite + sep + 'view' + sep + 'views', destSite, turboSiteSetup.cacheHash, 'view-view-views-');
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
 * Write the project semantic version number value inside all the merged js files created by build.
 * This is useful to know which project version is stored on the generated js files.
 */
exports.markMergedJsWithVersion = function (destPath) {
    
    for (let target of global.setup.build.lib_ts.targets) {
        
        let isMergedFile = target.hasOwnProperty('mergedFile') && !StringUtils.isEmpty(target.mergedFile);
        
        if(isMergedFile){
            
            let sep = fm.dirSep();
            let destDist = destPath + sep + 'dist';
            
            let mergedFileContent = fm.readFile(destDist + sep + target.folder + sep + target.mergedFile + '.js');
            
            mergedFileContent = "// " + setupModule.getProjectRepoSemVer(true) + "\n" + mergedFileContent;
            
            fm.saveFile(destDist + sep + target.folder + sep + target.mergedFile + '.js', mergedFileContent);
        }
    }
}


/**
 * Join all the files from the specified array and get a string with the result
 */
let mergeFilesFromArray = function (array, basePath, deleteFiles = false) {
    
    let result = '';
    
    if(basePath !== ''){
        
        basePath += fm.dirSep();
    }
    
    for (let file of array) {
        
        result += fm.readFile(basePath + StringUtils.replace(file, '.scss', '.css')) + "\n\n";
    }
    
    if(deleteFiles){
        
        for (let file of array) {
            
            fm.deleteFile(basePath + StringUtils.replace(file, '.scss', '.css'));
        }
    }
    
    return result;
}


/**
 * Join all the css and js files for each folder on the specified path and generate the global js and css files
 */
let mergeCssAndJsByFolder = function (basePath, destPath, cacheHash, prefix = "comp-view-components-") {
    
    let sep = fm.dirSep();
    let items = fm.getDirectoryList(basePath);
    
    for (let item of items) {
        
        if(fm.isDirectory(basePath + fm.dirSep() + item)){
            
            // Merge all css files on the folder and generate the css
            let cssFiles = fm.findDirectoryItems(basePath + fm.dirSep() + item, /^.*\.css$/i, 'absolute', 'files');
            let cssContent = mergeFilesFromArray(cssFiles, '', true);
            
            if(!StringUtils.isEmpty(cssContent)){
                
                fm.saveFile(destPath + sep + prefix + item + '-' + cacheHash +'.css', cssContent);
            }
                        
            // Merge all the js files on the folder and generate the component js
            let jsFiles = fm.findDirectoryItems(basePath + fm.dirSep() + item, /.*\.js$/i, 'absolute', 'files');
            let jsContent = mergeFilesFromArray(jsFiles, '', true);
            
            if(!StringUtils.isEmpty(jsContent)){
                
                fm.saveFile(destPath + sep + prefix + item + '-' + cacheHash +'.js', jsContent);    
            }
        }
    }
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

            console.error('Could not find Git cmd executable. Please install git on your system and make sure it is globally accessible via cmd');
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


/**
 * This is a function that performs a hardblock of the current execution till the provided function returns a true value or
 * the provided number of miliseconds is complete
 */
let blockingSleepTill = function (verificationFun, maxTimeMs, timeExceededErrorMessage) {

    let currentTime = Date.now();
    
    while(Date.now() < currentTime + maxTimeMs){
        
        if(verificationFun()){
        
            return;
        }
    }
    
    console.error(timeExceededErrorMessage);
}