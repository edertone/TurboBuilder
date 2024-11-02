'use strict';

/**
 * this module contains all the code related to the build process
 */


const { StringUtils, ObjectUtils, EncodingUtils, ConversionUtils } = require('turbocommons-ts');
const { TurboSiteTestsManager } = require('turbotesting-node');
const { FilesManager } = require('turbodepot-node');
const { ConsoleManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');
const setupModule = require('./setup');
const appsModule = require('./apps');
const validateModule = require('./validate');
const syncModule = require('./sync');
const sass = require('sass');
const sharp = require('sharp');
const UglifyJS = require("uglify-es");

const fm = new FilesManager();
const cm = new ConsoleManager();
const terminalManager = new TerminalManager();


/**
 * We will delete the unpacked src files when application exits, may it be due to a
 * success or an error
 */
process.on('exit', () => {

    this.removeUnusedTargetFiles(global.runtimePaths.target + fm.dirSep() + setupModule.getProjectName());
});


/**
 * Execute the build process
 */
exports.execute = function () {

    cm.text("\nbuild start: " + setupModule.detectProjectTypeFromSetup(global.setup));
    
    let buildFullPath = global.runtimePaths.target + fm.dirSep() + setupModule.getProjectName();
    
    if(global.setup.validate.runBeforeBuild){
        
        validateModule.execute(false);
    }
    
    // Node cmd apps are not built, cause we run them installed globally via npm install -g
    if(global.setup.build.app_node_cmd){
        
        return cm.success('build ok (no files affected or created)');
    }
    
    // Angular libs are built using ng cli and nothing more is necessary
    if(global.setup.build.lib_angular){
        
        return this.buildLibAngular();
    }
    
    // Angular apps are built using ng cli and nothing more is necessary
    if(global.setup.build.app_angular){
        
        this.buildAppAngular(buildFullPath);
        this.applyCodeWildCards(buildFullPath);
        this.applyVersionWildCard(buildFullPath);
        
    }else{
        
        // Copy all the src main files to the target build folder
        this.copyMainFiles(buildFullPath);
        
        // Perform custom build depending on project type
        if(global.setup.build.site_php || global.setup.build.server_php){
            
            this.buildSitePhp(buildFullPath);
        }
        
        if(global.setup.build.lib_php){
            
            this.buildLibPhp(setupModule.getProjectName());
        }
        
        if(global.setup.build.lib_js){
            
            this.buildLibJs(buildFullPath);
        }
        
        if(global.setup.build.lib_ts){
        
            this.buildLibTs(buildFullPath);
        }
    }
    
    // Check if sync is configured to be executed after build
    if(global.setup.sync && global.setup.sync.runAfterBuild){
        
        syncModule.execute(false);
    }
    
    cm.success('build ok');
};


/**
 * Copy all the project src/main files to the target folder. Any unwanted files/folders are excluded
 */
exports.copyMainFiles = function (destPath) {
    
    // If source file is empty, alert the user
    if(!fm.isDirectory(global.runtimePaths.main) ||
       fm.findDirectoryItems(global.runtimePaths.main, /.*/i, 'relative', 'files').length === 0){
        
        cm.error('no files to build');
    }
    
    let destMain = destPath + fm.dirSep() + 'main';
    
    // Copy the main folder to the target
    fm.createDirectory(destMain, true);
    
    // Delete all the following files: thumbs.db .svn .git
    // TODO let filesToDelete = fm.findDirectoryItems(global.runtimePaths.main, /^(?!.*(thumbs\.db|\.svn|\.git)$)/i, 'absolute', 'files');
    
    fm.mirrorDirectory(global.runtimePaths.main, destMain);
    
    cm.success('copy main files ok');
    
    this.applyCodeWildCards(destPath);
    this.applyVersionWildCard(destPath);
}


/**
 * Execute the site_php build process to the specified dest folder
 */
exports.buildSitePhp = function (targetPath) {
    
    let sep = fm.dirSep();
        
    // Validate turbosite setup existsists
    if(!fm.isFile(global.runtimePaths.root + sep + global.fileNames.turboSiteSetup)){
    
        cm.error(global.fileNames.turboSiteSetup + ' does not exist');
    }
    
    let tsm = new TurboSiteTestsManager('./');
    let baseUrlPath = setupModule.getTurboSiteBaseUrl();
    let turboSiteSetup = setupModule.loadSetupFromDisk(global.fileNames.turboSiteSetup, global.isRelease);
    let targetMainPath = targetPath + sep + 'main';
    let targetTmpPath = targetPath + sep + 'dist-tmp' + baseUrlPath;
    let targetTmpSitePath = targetTmpPath + sep + 'site';
                
    // Create the dist and site folders if not exists
    if(!fm.createDirectory(targetTmpPath, true)){
        
        cm.error('Could not create ' + targetTmpPath);
    }
    
    if(!fm.createDirectory(targetTmpSitePath)){
        
        cm.error('Could not create ' + targetTmpSitePath);
    }
    
    fm.copyDirectory(targetMainPath, targetTmpSitePath);
    
    // Move htaccess file from site to dist
    fm.copyFile(targetTmpSitePath + sep + 'htaccess.txt', targetTmpPath + sep + '.htaccess');
    fm.deleteFile(targetTmpSitePath + sep + 'htaccess.txt');
    
    // Read the turbodepot.json file if exists and add its contents to the index php file
    if(fm.isFile(global.runtimePaths.root + sep + 'turbodepot.json')){
    
        let turboDepotSetup = setupModule.loadSetupFromDisk('turbodepot.json', global.isRelease);
        
        tsm.saveSetupToIndexPhp(turboDepotSetup, 'turbodepot', targetTmpSitePath + sep + 'index.php');
    }
    
    // Generate a random hash to avoid browser caches
    turboSiteSetup.cacheHash = StringUtils.generateRandom(15, 15);
    
    // Save the turbosite setup to the index php file
    tsm.saveSetupToIndexPhp(turboSiteSetup, 'turbosite', targetTmpSitePath + sep + 'index.php');

    // Fail if errors or warnings are configured to be sent to browser
    if(global.isRelease && (turboSiteSetup.errorSetup.exceptionsToBrowser || turboSiteSetup.errorSetup.warningsToBrowser)){
        
        cm.error("Exceptions or warnings are enabled to be shown on browser. " +
                "This is a security problem. Please disable them on " + global.fileNames.turboSiteSetup);
    }
    
    // Process all sass scss files to css
    let scssFiles = fm.findDirectoryItems(targetTmpSitePath, /^.*\.scss$/i, 'absolute', 'files');
    
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
    generateFavicons(targetTmpSitePath + sep + 'resources' + sep + 'favicons', targetTmpSitePath, turboSiteSetup.cacheHash);
    
    // Generate the array of css files that will be merged into the global css file
    let globalCssFiles = ObjectUtils.clone(turboSiteSetup.globalCss);
    
    for (let globalComponent of turboSiteSetup.globalComponents) {
        
        globalCssFiles.push(globalComponent + '.css');
    }
    
    let viewsRoot = targetTmpSitePath + sep + 'view' + sep + 'views';
        
    // Create all the css and js files
    if(fm.isDirectory(viewsRoot)){
        
        // Global css file
        fm.saveFile(targetTmpSitePath + sep + 'glob-' + turboSiteSetup.cacheHash +'.css',
                mergeFilesFromArray(globalCssFiles, targetTmpSitePath, true));
        
        // Generate the array of js files that will be merged into the global js file
        let globalJsFiles = [];
        
        for (let globalJsFile of turboSiteSetup.globalJs) {
            
            if(!fm.isFile(targetTmpSitePath + sep + globalJsFile)){
            
                cm.error('Error loading global JS file. Make sure the path on turbosite.json is correct for:\n' + globalJsFile);
            }
            
            globalJsFiles.push(globalJsFile);
        }
                
        for (let globalComponent of turboSiteSetup.globalComponents) {
            
            globalJsFiles.push(globalComponent + '.js');
        }
        
        // Create global Js file
        fm.saveFile(targetTmpSitePath + sep + 'glob-' + turboSiteSetup.cacheHash +'.js',
                mergeFilesFromArray(globalJsFiles, targetTmpSitePath, true));
        
        // Process all the project views to inject global html code, and create the view js merged and css files
        for (let viewName of fm.getDirectoryList(viewsRoot)) {
            
            if(fm.isDirectory(viewsRoot + sep + viewName)){
                
                // Read the php code of the view in case it needs to be altered by the compilation
                let viewHtmlCode = fm.readFile(viewsRoot + sep + viewName + sep + viewName + '.php');
                                    
                // Check if global html code must be injected to the views
                if(turboSiteSetup.globalHtml.length > 0){
                        
                    // Search for all the html code that needs to be injected
                    for (let globalHtmlItem of turboSiteSetup.globalHtml) {
                    
                        if(globalHtmlItem.affectedViews.includes("*") || globalHtmlItem.affectedViews.includes(viewName)) {
                            
                            try{
                                
                                let htmlCodeToInject = fm.readFile(global.runtimePaths.main + sep + globalHtmlItem.path);
                            
                                if(globalHtmlItem.codePlacement === 'start'){
                                    
                                    viewHtmlCode = StringUtils.replace(viewHtmlCode,
                                        `<${globalHtmlItem.element}>`, `<${globalHtmlItem.element}>\n${htmlCodeToInject}`, 1);
                                    
                                }else{
                                    
                                    viewHtmlCode = StringUtils.replace(viewHtmlCode,
                                        `</${globalHtmlItem.element}>`, `${htmlCodeToInject}\n</${globalHtmlItem.element}>`, 1);
                                }
                                
                            }catch(e){
                    
                                cm.error('Error loading globalHtml path for <' + globalHtmlItem.element + '>: ' + e.toString() + '\n' +
                                    targetTmpSitePath + sep + globalHtmlItem.path + '\n');
                            }
                        }                        
                    }
                    
                    fm.saveFile(viewsRoot + sep + viewName + sep + viewName + '.php', viewHtmlCode);
                }
                                
                // Generate an array with the view css file plus all the defined view components css files
                let cssFiles = [viewsRoot + sep + viewName + sep + viewName + '.css'];
                
                // Generate an array with the view js file plus all the defined view components js files
                let jsFiles = [viewsRoot + sep + viewName + sep + viewName + '.js'];
                
                // Append all the components related to this view to the arrays of css and js files
                for (let viewComponent of turboSiteSetup.viewComponents) {
                    
                    if(viewComponent.view === viewName){
                        
                        for (let component of viewComponent.components) {
                            
                            cssFiles.push(targetTmpSitePath + sep + component + '.css');
                            
                            if(!fm.isFile(cssFiles[cssFiles.length - 1])){
                                
                                cm.error('Missing component file ' + component + '.css');
                            }                    
                            
                            jsFiles.push(targetTmpSitePath + sep + component + '.js');
                            
                            if(!fm.isFile(jsFiles[jsFiles.length - 1])){
                                
                                cm.error('Missing component file ' + component + '.js');
                            }
                        }
                    }
                }
                
                // Merge all the css and js arrays into single css and js files            
                let cssContent = mergeFilesFromArray(cssFiles, '', true);
                
                if(!StringUtils.isEmpty(cssContent)){
                    
                    fm.saveFile(targetTmpSitePath + sep + 'view-view-views-' + viewName + '-' + turboSiteSetup.cacheHash +'.css', cssContent);
                }
                            
                let jsContent = mergeFilesFromArray(jsFiles, '', true);
                
                // Minify the js code to check if it is empty or contains only "use strict". In that case it will be ignored 
                if(!StringUtils.isEmpty(UglifyJS.minify(jsContent).code, ['"use strict"', ';'])){
                    
                    fm.saveFile(targetTmpSitePath + sep + 'view-view-views-' + viewName + '-' + turboSiteSetup.cacheHash +'.js', jsContent);    
                }
            }
        }
    }
    
    // Mirror the generated tmp site to the previous one
    let targetDistPath = targetPath + sep + 'dist' + baseUrlPath;
    
    if(!fm.isDirectory(targetDistPath, true) &&
       !fm.createDirectory(targetDistPath, true)){
        
        cm.error('Could not create ' + targetDistPath);
    }
    
    fm.mirrorDirectory(targetTmpPath, targetDistPath);
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
            
            cm.error('Could not rename file with cache hash: ' + filePathWithHash);
        }
        
        return StringUtils.getPathElement(filePathWithHash);
    }
    
    if(!fm.isDirectory(faviconsSource) || !fm.isDirectory(faviconsDest)){
    
        return;    
    }
    
    let faviconFiles = fm.findDirectoryItems(faviconsSource, /^.*\.png$/i, 'name', 'files');
    
    // If no favicons are specified, launch a warning
    if(faviconFiles.length <= 0){
        
        cm.warning("Warning: No favicons specified");
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
            
            cm.error('Unexpected favicon name: ' + faviconFile);
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
                        
                        if(err) {
                            
                            cm.error('Could not generate favicon : ' + faviconsDest + sep + faviconExpectedFile.name + "\n" + err);
                        }
                    });
                
                // Hard block: wait till we are sure the file is created
                appsModule.blockingSleepTill(() => {return fm.isFile(faviconsDest + sep + faviconExpectedFile.name);}, 60000,
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
                        
                        if(err) {
                            
                            cm.error('Could not generate favicon: ' + faviconsDest + sep + faviconExpectedFile.name + "\n" + err);
                        }
                    });
                
                // Hard block: wait till we are sure the file is created
                appsModule.blockingSleepTill(() => {return fm.isFile(faviconsDest + sep + destFaviconWithHash);}, 60000,
                    'Could not generate favicon: ' + faviconsDest + sep + faviconExpectedFile.name);
            }
        }
    }
}


/**
 * Execute the lib_php build process to the specified folder (relative to the root of the target path)
 * And place the resulting files into the targetRelativePath/dist folder
 */
exports.buildLibPhp = function (targetRelativePath) {
    
    let sep = fm.dirSep();
    let targetAbsoluteDistPath = global.runtimePaths.target + fm.dirSep() + targetRelativePath + sep + 'dist';
    
    // autoloader.php must exist on src/main/php/ for the phar to be correctly generated
    let autoLoaderPath = global.runtimePaths.main + sep + 'php' + sep + 'autoLoader.php';
    
    if(!fm.isFile(autoLoaderPath)){
        
        cm.error(autoLoaderPath + " not found.\nThis is required to create a phar that loads classes automatically");
    }
    
    // Define the contents for the stub file that will be autoexecuted when the phar file is included
    let pharName = setupModule.getProjectName() + "-" + setupModule.getProjectRepoSemVer() + '.phar';
    
    let phpStubFile = "<?php Phar::mapPhar(); include \\'phar://" + pharName + "/php/autoloader.php\\'; __HALT_COMPILER(); ?>";
    
    // Create the dist folder if not exists
    if(!fm.isDirectory(targetAbsoluteDistPath) && !fm.createDirectory(targetAbsoluteDistPath)){
        
        cm.error('Could not create ' + targetAbsoluteDistPath);
    }
    
    // Create the phar using the current project name
    let phpExecCommand = `-d display_errors -r "`;
    phpExecCommand += " $p = new Phar('" + targetRelativePath + "/dist/" + pharName + "', FilesystemIterator::CURRENT_AS_FILEINFO | FilesystemIterator::KEY_AS_FILENAME, '" + pharName + "');";
    phpExecCommand += " $p->startBuffering();";
    phpExecCommand += " $p->setStub('" + phpStubFile + "');";
    phpExecCommand += " $p->buildFromDirectory('" + targetRelativePath + "/main');";
    phpExecCommand += " $p->compressFiles(Phar::GZ); $p->stopBuffering();";
    phpExecCommand += '"';
    
    let phpExeResult = appsModule.callPhpCmd(phpExecCommand);
    
    if(!fm.isFile(targetAbsoluteDistPath + sep + pharName)){
        
        cm.error(targetAbsoluteDistPath + sep + pharName + ` could not be created.\n${phpExeResult.output}\nMake sure phar generation is enabled on the current php installation`);
    }
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
        
        cm.error('Could not create ' + destDist);
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
    if (!fm.isFile(tsConfig)) {
        
        try{
            
            fm.saveFile(tsConfig, '{"compilerOptions":{"target": "es5"}}');
            
        }catch(e){
            
            cm.error('Could not create ' + tsConfig);
        }        
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
        
        let tsResult = terminalManager.exec(tsExecution);
        
        if(tsResult.failed){
           
            cm.error('Typescript compilation failed: \n\n' + tsResult.output);
        }

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
            
            let webpackExecResult = terminalManager.exec(webPackCmd);
            
            if(webpackExecResult.failed){
                
                cm.error('Webpack command failed: ' + webPackCmd + '\n\n' + webpackExecResult.output);
            }
            
            cm.success('Webpack ' + target.jsTarget + ' ok');
            
            fm.deleteDirectory(compiledFolder);   
        }
    }
}


/**
 * Execute the lib_angular build process
 */
exports.buildLibAngular = function () {
    
    // Use angular cli (the one that is installed on the current project node_modules folder) to compile the project to the target folder
    let angularBuildCommand = 'build ' + setupModule.getProjectName();
    cm.text("\nLaunching ng " + angularBuildCommand + "\n");
    
    if(terminalManager.exec('"./node_modules/.bin/ng" ' + angularBuildCommand, true).failed){
        
        cm.error('build failed');
    }
    
    cm.success('build ok');
}


/**
 * Execute the app_angular build process
 */
exports.buildAppAngular = function (destPath) {
    
    let sep = fm.dirSep();
    
    // Use angular cli (the one that is installed on the current project node_modules folder) to compile the project to the target folder
    // Notice that we enable --output-hashing=all to prevent browsers from caching the generated files 
    let prod = global.isRelease ? ' --configuration production' : ' --configuration development';
     
    let angularBuildCommand = `build${prod} --output-hashing=all --output-path="${destPath + sep}dist"`;
    
    cm.text("\nLaunching ng " + angularBuildCommand + "\n");

    if(terminalManager.exec('"./node_modules/.bin/ng" ' + angularBuildCommand, true).failed){
        
        cm.error('angular compilation failed: ' + angularBuildCommand);
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
exports.applyCodeWildCards = function (destPath) {
    
    if(global.setup.wildCards && global.setup.wildCards.codeWildCards){
    
        let replacedFiles = 0;
         
        for(let wildCard of global.setup.wildCards.codeWildCards){

            if(wildCard.enabled && !StringUtils.isEmpty(wildCard.wildCard)){
                
                let filesToReplace = getFilesFromIncludeList(destPath, wildCard.includes, wildCard.excludes);
                
                for (let fileToReplace of filesToReplace) {
                    
                    let fileContent = fm.readFile(fileToReplace);
                    
                    if(fileContent.indexOf(wildCard.wildCard) >= 0){
                        
                        fm.saveFile(fileToReplace, StringUtils.replace(fileContent, wildCard.wildCard,
                            (global.isRelease ? wildCard.releaseValue : wildCard.buildValue)));
                        
                        replacedFiles ++;
                    }
                }
            }
        }
        
        cm.success('replaced code wildcards on ' + replacedFiles + ' files');
    }
}


/**
 * Replace the project version number on all the files as defined on project setup
 */
exports.applyVersionWildCard = function (destPath) {

    let sep = fm.dirSep();
    
    if(!global.setup.wildCards ||
       !global.setup.wildCards.versionWildCard ||
       !global.setup.wildCards.versionWildCard.enabled){
    
        return;
    }

    let wildCard = global.setup.wildCards.versionWildCard.wildCard;    
    let version = setupModule.getProjectRepoSemVer(false);
   
    // Encode the project version to base 64 if configured
    if(global.setup.wildCards.versionWildCard.encodeAsBase64){
    
        version = ConversionUtils.stringToBase64(version);
    }
    
    if(global.setup.wildCards.versionWildCard.files.includes.length > 0){
        
        let filesToRename = getFilesFromIncludeList(destPath,
            global.setup.wildCards.versionWildCard.files.includes,
            global.setup.wildCards.versionWildCard.files.excludes);
         
        for (let fileToRename of filesToRename) {
            
            fm.renameFile(fileToRename, StringUtils.getPath(fileToRename) + sep +
                StringUtils.getPathElementWithoutExt(fileToRename) + version + '.' + StringUtils.getPathExtension(fileToRename));
        }
        
        cm.success('renamed ' + filesToRename.length + ' files with project version ' + version);        
    }
    
    let replacedFiles = 0;
    
    if(!StringUtils.isEmpty(wildCard)){
        
        let filesToReplace = getFilesFromIncludeList(destPath,
            global.setup.wildCards.versionWildCard.code.includes,
            global.setup.wildCards.versionWildCard.code.excludes);
         
        for (let fileToReplace of filesToReplace) {
            
            let fileContent = fm.readFile(fileToReplace);
            
            if(fileContent.indexOf(wildCard) >= 0){
                
                fm.saveFile(fileToReplace, StringUtils.replace(fileContent, wildCard, version));
                replacedFiles ++;
            }
        }
    }
    
    cm.success('replaced project version ' + version + ' on ' + replacedFiles + ' files');
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
exports.removeUnusedTargetFiles = function (destPath) {

    // Angular apps are exclusively compiled with ng cli, so we won't alter in any way the result of its
    // compilation
    if(global.setup &&
       (global.setup.build.lib_angular || global.setup.build.app_angular)){
            
        return;
    }
    
    let destMain = destPath + fm.dirSep() + 'main';
    
    // Delete the files
    if(fm.isDirectory(destMain)){
        
        try{
            
            fm.deleteDirectory(destMain);
            
        }catch(e){
            
            cm.error('Could not delete unpacked src files from ' + destMain);
        }        
    }
    
    // Delete dist-tmp folder if it exists
    let destDist = destPath + fm.dirSep() + 'dist-tmp';
    
    if(fm.isDirectory(destDist)){
        
        try{
            
            fm.deleteDirectory(destDist);
            
        }catch(e){
            
            cm.error('Could not delete folder: ' + destDist);
        }
    }
}