'use strict';

/**
 * this module contains all the code related to the build process
 */


const { StringUtils, ObjectUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { execSync } = require('child_process');
const console = require('./console');
const setupModule = require('./setup');
const validateModule = require('./validate');
const syncModule = require('./sync');
const sass = require('node-sass');
const sharp = require('sharp');
const sitePhpTestUtils = require('../resources/project-templates/site_php/src/test/js/sitephp-test-utils.js');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * We will delete the unpacked src files when application exits, may it be due to a
 * success or an error
 */
process.on('exit', () => {

    this.removeUnpackedSrcFiles(global.runtimePaths.target + fm.dirSep() + setupModule.getProjectName());
});


/**
 * Execute the build process
 */
exports.execute = function () {
    
    console.log("\nbuild start: " + setupModule.detectProjectTypeFromSetup(global.setup));
    
    if(global.setup.validate.runBeforeBuild){
        
        validateModule.execute(false);
    }
    
    let buildFullPath = global.runtimePaths.target + fm.dirSep() + setupModule.getProjectName();
    
    // Angular libs are built using ng cli and nothing more is necessary
    if(global.setup.build.lib_angular){
        
        return this.buildLibAngular();
    }
    
    // Angular apps are built using ng cli and nothing more is necessary
    if(global.setup.build.app_angular){
        
        this.buildAppAngular(buildFullPath);
    
        console.success('build ok');
        
        return;
    }
    
    // Delete all files inside the target/project name folder
    if(fm.isDirectory(buildFullPath)){
    
        fm.deleteDirectory(buildFullPath);
    }
    
    // Node cmd apps are not built, cause we run them installed globally via npm install -g
    if(global.setup.build.app_node_cmd){
        
        return console.success('build ok (no files affected or created)');
    }
    
    // Copy all the src main files to the target build folder
    this.copyMainFiles(buildFullPath);
    
    // Perform custom build depending on project type
    if(global.setup.build.site_php || global.setup.build.server_php){
        
        this.buildSitePhp(buildFullPath);
    }
    
    if(global.setup.build.lib_php){
        
        this.buildLibPhp(buildFullPath);
    }
    
    if(global.setup.build.lib_js){
        
        this.buildLibJs(buildFullPath);
    }
    
    if(global.setup.build.lib_ts){
    
        this.buildLibTs(buildFullPath);
    }
    
    // Check if sync is configured to be executed after build
    if(global.setup.sync && global.setup.sync.runAfterBuild){
        
        syncModule.execute(false);
    }
    
    console.success('build ok');
};


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
    
    console.success('copy main files ok');
    
    this.replaceVersionOnAllFiles(destPath);
}


/**
 * Execute the site_php build process to the specified dest folder
 */
exports.buildSitePhp = function (destPath) {
    
    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    let destDist = destPath + sep + 'dist';
    let destSite = destDist + sep + 'site';
    
    // Validate turbosite setup exists
    if(!fm.isFile(global.runtimePaths.root + sep + global.fileNames.turboSiteSetup)){
    
        console.error(global.fileNames.turboSiteSetup + ' does not exist');
    }
    
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
    
    // Read the turbodepot.json file and add its contents to the index php file
    if(fm.isFile(global.runtimePaths.root + sep + 'turbodepot.json')){
    
        let turboDepotSetup = JSON.parse(fm.readFile(global.runtimePaths.root + sep + 'turbodepot.json'));
        
        sitePhpTestUtils.saveSetupToIndexPhp(turboDepotSetup, 'turbodepot', destSite + sep + 'index.php');
    }
    
    // Read the turbosite.json file
    let turboSiteSetup = JSON.parse(fm.readFile(global.runtimePaths.root + sep + global.fileNames.turboSiteSetup));
    
    // Generate a random hash to avoid browser caches
    turboSiteSetup.cacheHash = StringUtils.generateRandom(15, 15);
    
    // If the file turbosite.release.json exists at the root of our project, all its setup properties will
    // override the turbosite.json if the release process is being executed
    let tsReleasePath = global.runtimePaths.root + sep + 'turbosite.release.json';
    
    if(fm.isFile(tsReleasePath) && global.isRelease){
        
        let tsSetupRelease = JSON.parse(fm.readFile(tsReleasePath));
        
        ObjectUtils.merge(turboSiteSetup, tsSetupRelease);        
    }
    
    // Save the turbosite setup to the index php file
    sitePhpTestUtils.saveSetupToIndexPhp(turboSiteSetup, 'turbosite', destSite + sep + 'index.php');

    // Fail if errors or warnings are configured to be sent to browser
    if(global.isRelease && (turboSiteSetup.errorSetup.exceptionsToBrowser || turboSiteSetup.errorSetup.warningsToBrowser)){
        
        console.error("Exceptions or warnings are enabled to be shown on browser. " +
                "This is a security problem. Please disable them on " + global.fileNames.turboSiteSetup);
    }
    
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
    generateFavicons(destSite + sep + 'resources' + sep + 'favicons', destSite, turboSiteSetup.cacheHash);
    
    // Generate the array of css files that will be merged into the global css file
    let globalCssFiles = ObjectUtils.clone(turboSiteSetup.globalCss);
    
    for (let globalComponent of turboSiteSetup.globalComponents) {
        
        globalCssFiles.push(globalComponent + '.css');
    }
    
    // Create the global css file
    let viewsRoot = destSite + sep + 'view' + sep + 'views';
        
    if(fm.isDirectory(viewsRoot)){
        
        fm.saveFile(destSite + sep + 'glob-' + turboSiteSetup.cacheHash +'.css',
                mergeFilesFromArray(globalCssFiles, destSite, true));
        
        // Generate the array of js files that will be merged into the global js file
        let globalJsFiles = ObjectUtils.clone(turboSiteSetup.globalJs);
        
        for (let globalComponent of turboSiteSetup.globalComponents) {
            
            globalJsFiles.push(globalComponent + '.js');
        }
        
        // Create global Js file
        fm.saveFile(destSite + sep + 'glob-' + turboSiteSetup.cacheHash +'.js',
                mergeFilesFromArray(globalJsFiles, destSite, true));
        
        // Generate all the views css and js merged files
        for (let viewName of fm.getDirectoryList(viewsRoot)) {
            
            if(fm.isDirectory(viewsRoot + sep + viewName)){
                
                if(!fm.isFile(viewsRoot + sep + viewName + sep + viewName + '.php')){
                    
                    console.error('View ' + viewName + ' must have a ' + viewName + '.php file');
                }
    
                // Add extra html code to the view if necessary
                let viewHtmlCode = fm.readFile(viewsRoot + sep + viewName + sep + viewName + '.php');
                
                let afterBodyOpenHtml = '';
                
                for (let afterBodyOpenPath of turboSiteSetup.globalHtml.afterBodyOpen) {
    
                    if(!fm.isFile(destSite + sep + afterBodyOpenPath)){
                    
                        console.error('afterBodyOpen file not found: ' + afterBodyOpenPath);
                    }
                    
                    afterBodyOpenHtml += "\n" + fm.readFile(destSite + sep + afterBodyOpenPath);
                }
                
                let beforeBodyCloseHtml = '';
                
                for (let beforeBodyClosePath of turboSiteSetup.globalHtml.beforeBodyClose) {
    
                    if(!fm.isFile(destSite + sep + beforeBodyClosePath)){
                    
                        console.error('beforeBodyClose file not found: ' + beforeBodyClosePath);
                    }
                    
                    beforeBodyCloseHtml += "\n" + fm.readFile(destSite + sep + beforeBodyClosePath);
                }
                
                if(!StringUtils.isEmpty(afterBodyOpenHtml) || !StringUtils.isEmpty(beforeBodyCloseHtml)){
                     
                    viewHtmlCode = StringUtils.replace(viewHtmlCode, '<body>', '<body>' + afterBodyOpenHtml, 1);
                    viewHtmlCode = StringUtils.replace(viewHtmlCode, '</body>', beforeBodyCloseHtml + "\n</body>", 1);
                    
                    fm.saveFile(viewsRoot + sep + viewName + sep + viewName + '.php', viewHtmlCode);
                }
                
                // Generate an array with the view css file plus all the defined view components css files
                let cssFiles = [viewsRoot + sep + viewName + sep + viewName + '.css'];
                
                if(!fm.isFile(cssFiles[0])){
                    
                    console.error('View ' + viewName + ' must have a ' + viewName + '.css file');
                }
                
                // Generate an array with the view js file plus all the defined view components js files
                let jsFiles = [viewsRoot + sep + viewName + sep + viewName + '.js'];
                
                if(!fm.isFile(jsFiles[0])){
                    
                    console.error('View ' + viewName + ' must have a ' + viewName + '.js file');
                }
                
                // Append all the components related to this view to the arrays of css and js files
                for (let viewComponent of turboSiteSetup.viewComponents) {
                    
                    if(viewComponent.view === viewName){
                        
                        for (let component of viewComponent.components) {
                            
                            cssFiles.push(destSite + sep + component + '.css');
                            
                            if(!fm.isFile(cssFiles[cssFiles.length - 1])){
                                
                                console.error('Missing component file ' + component + '.css');
                            }                    
                            
                            jsFiles.push(destSite + sep + component + '.js');
                            
                            if(!fm.isFile(jsFiles[jsFiles.length - 1])){
                                
                                console.error('Missing component file ' + component + '.js');
                            }
                        }
                        
                    }
                }
                
                // Merge all the css and js arrays into single css and js files            
                let cssContent = mergeFilesFromArray(cssFiles, '', true);
                
                if(!StringUtils.isEmpty(cssContent)){
                    
                    fm.saveFile(destSite + sep + 'view-view-views-' + viewName + '-' + turboSiteSetup.cacheHash +'.css', cssContent);
                }
                            
                let jsContent = mergeFilesFromArray(jsFiles, '', true);
                
                if(!StringUtils.isEmpty(jsContent)){
                    
                    fm.saveFile(destSite + sep + 'view-view-views-' + viewName + '-' + turboSiteSetup.cacheHash +'.js', jsContent);    
                }
            }
        }
    }
}


/**
 * Process the favicon or favicons from a specified source folder and generate all the favicon files on a destination folder by compressing
 * and optimizing the input and also generating any missing ones based on the provided source images.
 */
let generateFavicons = function (faviconsSource, faviconsDest, addHash = '') {
    
    let sep = fm.dirSep();
    
    // Aux method to add the cache hash to a file and rename it
    let renameFileToAddHash = (filePath, hash) => {
        
        if(hash === ''){
            
            return StringUtils.getPathElement(filePath);
        }
        
        let filePathWithHash = filePath.replace(StringUtils.getPathElement(filePath),
                StringUtils.getPathElementWithoutExt(filePath) + '-' + hash + '.' + StringUtils.getPathExtension(filePath));
        
        if(!fm.renameFile(filePath, filePathWithHash)){
            
            console.error('Could not rename file with cache hash: ' + filePathWithHash);
        }
        
        return StringUtils.getPathElement(filePathWithHash);
    }
    
    if(!fm.isDirectory(faviconsSource) || !fm.isDirectory(faviconsDest)){
    
        return;    
    }
    
    let faviconFiles = fm.findDirectoryItems(faviconsSource, /^.*\.png$/i, 'name', 'files');
    
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
    
    // Make sure all favicons on the source folder match any of the expected ones
    for (let faviconFile of faviconFiles) {
        
        let fileNameFound = false;
        
        for (let faviconExpectedFile of faviconExpectedFiles) {

            if(faviconFile === faviconExpectedFile.name){
                
                fileNameFound = true;
                
                // As the favicon file is found, we will copy it to the destination now
                fm.copyFile(faviconsSource + sep + faviconFile, faviconsDest + sep + faviconFile);
                
                break;
            }
        }
        
        if(!fileNameFound){
            
            console.error('Unexpected favicon name: ' + faviconFile);
        }
    }
    
    // We will now find the biggest favicon on the source path.
    // To do it, we will look on the list of expected favicons, which is sorted by size from biggest to smallest.
    // The first one that is found on expected list and source path will be the biggest one.
    let biggestFound = '';
    
    for (let faviconExpectedFile of faviconExpectedFiles) {

        if(faviconFiles.indexOf(faviconExpectedFile.name) >= 0){
            
            biggestFound = faviconExpectedFile.name;
            renameFileToAddHash(faviconsDest + sep + faviconExpectedFile.name, addHash);
            
            break;
        }
    }
    
    if(biggestFound === ''){
    
        return;
    }

    // Generate all missing favicon images with the sharp image processing library
    for (let faviconExpectedFile of faviconExpectedFiles) {

        // Check if this expected favicon file exists on the favicons source
        if(faviconFiles.indexOf(faviconExpectedFile.name) >= 0){
            
            if(biggestFound !== faviconExpectedFile.name){
            
                renameFileToAddHash(faviconsDest + sep + faviconExpectedFile.name, addHash);
            }  
        
        // The expected favicon does not exist on the favicons source, so we must generate it from the biggest one
        }else{

            // Apple touch icons are placed at the root of the site cause they are autodetected by apple devices
            if(faviconExpectedFile.name.indexOf("apple-touch-") === 0){
                
                // Use the amazing sharp lib to resize the image to the missing width and height
                sharp(faviconsSource + sep + biggestFound)
                    .resize(faviconExpectedFile.w, faviconExpectedFile.h)
                    .toFile(faviconsDest + sep + faviconExpectedFile.name, function(err) {
                        
                        if(err || !fm.isFile(faviconsDest + sep + faviconExpectedFile.name)) {
                            
                            console.error('Could not generate favicon : ' + faviconsDest + sep + faviconExpectedFile.name + "\n" + err);
                        }
                    });
                
                // Hard block till we are sure the file is created
                blockingSleepTill(() => {return fm.isFile(faviconsDest + sep + faviconExpectedFile.name);}, 60000,
                    'Could not generate favicon : ' + faviconsDest + sep + faviconExpectedFile.name);
                                    
            }else{
                
                // Add the hash to the expected favicon
                let destFaviconWithHash = (addHash === '') ?
                    faviconExpectedFile.name :
                    StringUtils.getPathElementWithoutExt(faviconExpectedFile.name) + '-' + addHash
                        + '.' + StringUtils.getPathExtension(faviconExpectedFile.name);
                
                sharp(faviconsSource + sep + biggestFound)
                    .resize(faviconExpectedFile.w, faviconExpectedFile.h)
                    .toFile(faviconsDest + sep + destFaviconWithHash, function(err) {
                        
                        if(err || !fm.isFile(faviconsDest + sep + destFaviconWithHash)) {
                            
                            console.error('Could not generate favicon: ' + faviconsDest + sep + faviconExpectedFile.name + "\n" + err);
                        }
                    });
                
                // Hard block till we are sure the file is created
                blockingSleepTill(() => {return fm.isFile(faviconsDest + sep + destFaviconWithHash);}, 60000,
                    'Could not generate favicon: ' + faviconsDest + sep + faviconExpectedFile.name);
            }
        }
    }
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
    let pharName = setupModule.getProjectName() + "-" + setupModule.getProjectRepoSemVer() + '.phar';
    
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
 * Execute the lib_js build process to the specified dest folder
 */
exports.buildLibJs = function (destPath) {
    
    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    let destDist = destPath + sep + 'dist';
    
    // Create the dist folder if not exists
    if(!fm.isDirectory(destDist) && !fm.createDirectory(destDist)){
        
        console.error('Could not create ' + destDist);
    }
    
    // Copy the main source folder to the target dist
    fm.copyDirectory(destMain, destDist);
    
    // Get all the files on the js folder
    let jsFiles = fm.findDirectoryItems(destDist + sep + 'js', /^.*\.js$/i, 'absolute', 'files');
    
    // Merge all the js files code if necessary
    if(global.setup.build.lib_js.createMergedFile){
        
        let mergedJsCode = mergeFilesFromArray(jsFiles, '', false);
        
        // Read the index code and append it after the previous merged code
        mergedJsCode += "\n\n" + fm.readFile(destMain + sep + 'index.js');
        
        let mergedFileName = setupModule.getProjectName();
        
        if(global.setup.build.lib_js.mergedFileName && !StringUtils.isEmpty(global.setup.build.lib_js.mergedFileName)){
            
            mergedFileName = global.setup.build.lib_js.mergedFileName;
        }
        
        fm.saveFile(destDist + sep + mergedFileName + '.js', mergedJsCode);
    }
    
    // Clear the js files if necessary
    if(global.setup.build.lib_js.deleteNonMergedJs){
        
        fm.deleteFiles(jsFiles);
        fm.deleteFile(destDist + sep + 'index.js');
        fm.deleteDirectory(destDist + sep + 'js');
    }
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

        tsExecution += ' --noUnusedLocals';
        tsExecution += ' --noUnusedParameters';
        tsExecution += ' --alwaysStrict';             
        tsExecution += ' --target ' + target.jsTarget;
        tsExecution += ' --outDir "' + compiledFolder + '"';
        tsExecution += ' --module commonjs';
        tsExecution += ' --rootDir "' + destMain + sep + 'ts"';      
        tsExecution += ' --project "' + destMain + sep + 'ts"';                          
        console.exec(tsExecution);

        // Check if the target requires a merged JS file or not and
        // Generate it via webpack for the current target       
        if(isMergedFile){
            
            let webPackSetup = {
                mode: global.isRelease ? "production" : "development",
                entry: compiledFolder + sep + 'index.js',
                output: {
                    library: target.globalVar,
                    libraryTarget: 'var',
                    filename: target.mergedFile + '.js',
                    path: destDist + sep + target.folder
                }
            };
            
            if(global.setup.build.lib_ts.sourceMap){
                
                webPackSetup.devtool = 'source-map';
            }
            
            fm.saveFile(compiledFolder + sep + 'webpack.config.js', "module.exports = " + JSON.stringify(webPackSetup) + ";");
            
               let webPackCmd = global.installationPaths.webPackBin + ' --config "' + compiledFolder + sep + 'webpack.config.js"';
             
            console.exec(webPackCmd, 'Webpack ' + target.jsTarget + ' ok');
            
            fm.deleteDirectory(compiledFolder);   
        }
    }
}


/**
 * Execute the lib_angular build process
 */
exports.buildLibAngular = function () {
    
    // Use angular cli to compile the project to the target folder
    let angularBuildCommand = 'build ' + setupModule.getProjectName();
    console.log("\nLaunching ng " + angularBuildCommand + "\n");
    
    if(!console.exec('"./node_modules/.bin/ng" ' + angularBuildCommand, '', true)){
        
        console.error('build failed');
    }
    
    console.success('build ok');
}


/**
 * Execute the lib_angular build process
 */
exports.buildAppAngular = function (destPath) {
    
    let sep = fm.dirSep();
    
    // Use angular cli to compile the project to the target folder
    // Note that we enable --output-hashing=all to prevent browsers from caching the generated files 
    let prod = global.isRelease ? ' --prod' : '';
     
    let angularBuildCommand = `build${prod} --output-hashing=all --output-path="${destPath + sep}dist"`;
    
    console.log("\nLaunching ng " + angularBuildCommand + "\n");

    if(!console.exec('"./node_modules/.bin/ng" ' + angularBuildCommand, '', true)){
        
        console.error('angular compilation failed: ' + angularBuildCommand);
    }
    
    // Copy htaccess file if it exists to the target folder
    if(fm.isFile('./src/htaccess.txt')){
        
        fm.copyFile('./src/htaccess.txt', destPath + sep + 'dist' + sep + '.htaccess');
    }
    
    // Validate the index html code
    let indexHtmlCode = fm.readFile(destPath + sep + 'dist' + sep + 'index.html');
    
    // Generate favicons
    let faviconsHash = StringUtils.generateRandom(8, 8);
    
    generateFavicons('./src/assets/favicons', destPath + sep + 'dist', faviconsHash);
    
    // Add the html code to referene the favicons on the index.html generated file
    let faviconsCode = `<link rel="icon" type="image/png" sizes="16x16" href="16x16-${faviconsHash}.png">` +
                       `<link rel="icon" type="image/png" sizes="32x32" href="32x32-${faviconsHash}.png">` +
                       `<link rel="icon" type="image/png" sizes="96x96" href="96x96-${faviconsHash}.png">` +
                       `<link rel="icon" type="image/png" sizes="128x128" href="128x128-${faviconsHash}.png">` +
                       `<link rel="icon" type="image/png" sizes="196x196" href="196x196-${faviconsHash}.png">`;
   
    fm.saveFile(destPath + sep + 'dist' + sep + 'index.html', StringUtils.replace(indexHtmlCode, '</head>', faviconsCode + '</head>', 1));
}


/**
 * Replace the project version number on all the files as defined on project setup
 */
exports.replaceVersionOnAllFiles = function (destPath) {

    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    
    let wildCard = global.setup.build.replaceVersion.wildCard;
    
    if(!global.setup.build.replaceVersion.enabled || StringUtils.isEmpty(wildCard)){
    
        return;
    }
    
    let extensionsToReplace = global.setup.build.replaceVersion.extensions.join('|');
    
    let filesToReplaceRegExp = new RegExp("^.*\.(" + extensionsToReplace + ")$", "i" );
    
    let filesToReplace = fm.findDirectoryItems(destMain, filesToReplaceRegExp, 'absolute', 'files');
    
    for (let fileToReplace of filesToReplace) {
        
        let fileContent = fm.readFile(fileToReplace);
        
        if(fileContent.indexOf(wildCard) >= 0){
            
            fm.saveFile(fileToReplace, StringUtils.replace(fileContent, wildCard, setupModule.getProjectRepoSemVer(false)));
        }
    }
}


/**
 * Write the project semantic version number value inside all the merged js files created by build.
 * This is useful to know which project version is stored on the generated js files.
 */
exports.markMergedJsWithVersion = function (destPath) {
    
    let sep = fm.dirSep();
    let destDist = destPath + sep + 'dist';
    
    if(global.setup.build.lib_js){
        
        if(global.setup.build.lib_js.createMergedFile){
            
            let mergedFileName = setupModule.getProjectName();
            
            if(global.setup.build.lib_js.mergedFileName && !StringUtils.isEmpty(global.setup.build.lib_js.mergedFileName)){
                
                mergedFileName = global.setup.build.lib_js.mergedFileName;
            }
            
            let mergedFileContent = fm.readFile(destDist + sep + mergedFileName + '.js');
            
            mergedFileContent = "// " + setupModule.getProjectRepoSemVer(true) + "\n" + mergedFileContent;
            
            fm.saveFile(destDist + sep + mergedFileName + '.js', mergedFileContent);
        }
    
    }else{
        
        for (let target of global.setup.build.lib_ts.targets) {
            
            let isMergedFile = target.hasOwnProperty('mergedFile') && !StringUtils.isEmpty(target.mergedFile);
            
            if(isMergedFile){
                
                let mergedFileContent = fm.readFile(destDist + sep + target.folder + sep + target.mergedFile + '.js');
                
                mergedFileContent = "// " + setupModule.getProjectRepoSemVer(true) + "\n" + mergedFileContent;
                
                fm.saveFile(destDist + sep + target.folder + sep + target.mergedFile + '.js', mergedFileContent);
            }
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
 * Delete all the src main files that exist on target folder
 */
exports.removeUnpackedSrcFiles = function (destPath) {

    // Angular apps are exclusively compiled with ng cli, so we won't alter in any way the result of its
    // compilation
    if(global.setup &&
       (global.setup.build.lib_angular || global.setup.build.app_angular)){
            
        return;
    }
    
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

            console.error('Could not find winscp cmd executable. Please install winscp and make sure is available globally via cmd (add to PATH enviroment variable if necessary) to perform sync operations');
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