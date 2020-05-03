'use strict';

/**
 * this module contains all the code related to the release process
 */


const { StringUtils } = require('turbocommons-ts');
const { FilesManager } = require('turbodepot-node');
const { execSync } = require('child_process');
const { ConsoleManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');
const validateModule = require('./validate');
const syncModule = require('./sync');
const setupModule = require('./setup');
const buildModule = require('./build');
const UglifyJS = require("uglify-es");
const CleanCSS = require('clean-css');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

let fm = new FilesManager();
const cm = new ConsoleManager();
const terminalManager = new TerminalManager();


let releaseRelativePath = '';


/**
 * We will delete the unpacked src files when application exits, may it be due to a
 * success or an error
 */
process.on('exit', () => {
 
    buildModule.removeUnusedTargetFiles(global.runtimePaths.target + fm.dirSep() + this.getReleaseRelativePath());
});


/**
 * Execute the release process
 */
exports.execute = function () {
    
    global.isRelease = true;
    
    // Angular libs are only built via -b
    if(global.setup.build.lib_angular){
        
        cm.error("Angular libs can only be built with -b option");
    }
    
    cm.text("\nrelease start");
    
    let releaseFullPath = global.runtimePaths.target + fm.dirSep() + this.getReleaseRelativePath();
    
    // Delete all files inside the release path folder
    if(fm.isDirectory(releaseFullPath)){

        fm.deleteDirectory(releaseFullPath);
    }
    
    if(global.setup.validate.runBeforeBuild){
        
        validateModule.execute(false);
    }
    
    // Node cmd apps are not built, cause we run them installed globally via npm install -g
    if(global.setup.build.app_node_cmd){
        
        return cm.success('release ok (no files affected or created)');
    }
    
    // Angular apps are compiled exclusively with ng cli
    if(global.setup.build.app_angular){
        
        buildModule.buildAppAngular(releaseFullPath);
        minifyHtaccess(releaseFullPath);
        minifyHtmlFiles(releaseFullPath);
        minifyImages(releaseFullPath);
        buildModule.applyVersionWildCard(releaseFullPath);
        return;
    } 
    
    buildModule.copyMainFiles(releaseFullPath);
    
    if(global.setup.build.site_php || global.setup.build.server_php){
        
        buildModule.buildSitePhp(releaseFullPath);
    }
    
    if(global.setup.build.lib_php){
        
        buildModule.buildLibPhp(releaseFullPath);
    }
    
    if(global.setup.build.lib_js){
        
        buildModule.buildLibJs(releaseFullPath);
    }
    
    if(global.setup.build.lib_ts){
    
        buildModule.buildLibTs(releaseFullPath);
    }
    
    minifyJs(releaseFullPath);
    minifyCss(releaseFullPath);
    minifyHtaccess(releaseFullPath);
    minifyHtmlFiles(releaseFullPath);
    minifyPhpFiles(releaseFullPath);
    
    if(global.setup.release.optimizePictures){
    
        minifyImages(releaseFullPath);
    }

    // TODO - delete all minified view and component css/js files which are empty (useless), to prevent them from
    // being linked as simply empty js or css files at the views html part.
    
    // After js files are minified, we will write the project version
    // inside the merged js files of the lib_js and lib_ts projects
    if(global.setup.build.lib_js || global.setup.build.lib_ts){
        
        buildModule.markMergedJsWithVersion(releaseFullPath);
    }
    
    if(global.setup.release.generateCodeDocumentation){
        
        generateCodeDocumentation(releaseFullPath);
    }
    
    if(global.setup.release.gitChangeLog){
        
        createGitChangeLog(releaseFullPath);
    }
    
    // Check if sync is configured to be executed after build
    if(global.setup.sync && global.setup.sync.runAfterBuild){
        
        syncModule.execute(false);
    }
    
    cm.success('release ok (' + this.getReleaseRelativePath() + ')');
};


/**
 * Gets the path relative to project target where current release version will be generated
 */
exports.getReleaseRelativePath = function () {
    
    if(releaseRelativePath === ''){
        
        releaseRelativePath = setupModule.getProjectName() + "-" + setupModule.getProjectRepoSemVer(true);
    }

    return releaseRelativePath; 
}


/**
 * Minifies (overwrites) all the js files that exist on the provided path
 */
let minifyJs = function (destPath) {
    
    let sep = fm.dirSep();
    let destDist = destPath + sep + 'dist';
    
    let jsFiles = fm.findDirectoryItems(destDist, /.*\.js$/i, 'absolute', 'files');
    
    for (let jsFile of jsFiles) {
        
        let jsCode = fm.readFile(jsFile);
        
        let result = UglifyJS.minify(jsCode);
        
        if(result.error !== undefined){
            
            cm.error('Minification failed: ' + jsFile + "\n\n" + result.error);
        }
        
        fm.deleteFile(jsFile);        
        fm.saveFile(jsFile, result.code); 
    }
    
    if(jsFiles.length > 0){
        
        cm.success("minify Js ok");
    }
}


/**
 * Minifies (overwrites) all the css files that exist on the provided path
 */
let minifyCss = function (destPath) {
    
    let sep = fm.dirSep();
    let destDist = destPath + sep + 'dist';
    
    let cssFiles = fm.findDirectoryItems(destDist, /.*\.css$/i, 'absolute', 'files');
    
    for (let cssFile of cssFiles) {
        
        let cssCode = fm.readFile(cssFile);
        
        var result = new CleanCSS({
            level: {
                1: {
                  specialComments: 0
                }
              }
            }).minify(cssCode);
        
        if(result.errors.length > 0){
            
            cm.error('Minification failed: ' + cssFile + "\n\n" + result.error[0]);
        }
        
        fm.deleteFile(cssFile);
        fm.saveFile(cssFile, result.styles); 
    }
    
    if(cssFiles.length > 0){
        
        cm.success("minify Css ok");
    }
}


/**
 * Minifies (overwrites) all the image files that exist on the provided path
 */
let minifyImages = function (destPath) {
    
    let sep = fm.dirSep();
    let destDist = destPath + sep + 'dist';
    
    let imageFiles = fm.findDirectoryItems(destDist, /^.*\.(jpg|jpeg|png)$/i, 'absolute', 'files');
    
    for (let imageFile of imageFiles) {
        
        // Asynchronously overwrite all the project images with their optimized versions
        imagemin([imageFile], StringUtils.getPath(imageFile), {
            plugins: [
                imageminJpegtran({
                    progressive: true
                }),
                imageminPngquant({
                    quality: [0.8, 0.9],
                    speed: 1, // The lowest speed of optimization with the highest quality
                    floyd: 1 // Controls level of dithering (0 = none, 1 = full).
                })
            ]
        });
    }
    
    if(imageFiles.length > 0){
        
        cm.success("minify Images ok");
    }    
}


/**
 * Minifies (overwrites) all the html files that exist on the provided path
 */
let minifyHtmlFiles = function (destPath) {
    
    var minify = require('html-minifier').minify;
        
    let sep = fm.dirSep();
    let destDist = destPath + sep + 'dist';
    
    let htmlFiles = fm.findDirectoryItems(destDist, /^.*\.(php|html)$/i, 'absolute', 'files');
    
    for (let htmlFile of htmlFiles) {
        
        // if the path contains a libs folder, html minification will be ignored
        if(htmlFile.indexOf(sep + 'libs' + sep) >= 0){
           
            continue;
        }
        
        let htmlFileContent = fm.readFile(htmlFile);
        
        let htmlMinified = htmlFileContent;
        
        try{
            
            htmlMinified = minify(htmlFileContent, {
                collapseWhitespace: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                minifyCSS: true,
                minifyJS: true
            });
                        
        }catch(e){

            cm.error("Html minify failed:\n" + htmlFile);
        }
        
        fm.saveFile(htmlFile, htmlMinified); 
    }
    
    if(htmlFiles.length > 0){
        
        cm.success("minify html ok");
    }
}


/**
 * Minifies (overwrites) all the php files that exist on the provided path
 */
let minifyPhpFiles = function (destPath) {
    
    let sep = fm.dirSep();
    let destDist = destPath + sep + 'dist';
    
    let phpFiles = fm.findDirectoryItems(destDist, /.*\.php$/i, 'absolute', 'files');
    
    for (let phpFile of phpFiles) {
        
        let phpMinified = '';
        
        try{
            
            phpMinified = execSync('php -w "' + phpFile + '"', {stdio : 'pipe'}).toString();
            
        }catch(e){

            cm.error("Php minify failed");
        }
        
        fm.deleteFile(phpFile);
        fm.saveFile(phpFile, phpMinified); 
    }
    
    if(phpFiles.length > 0){
        
        cm.success("minify php ok");
    }
}


/**
 * Minifies (overwrites) all the .htaccess files that exist on the provided path
 */
let minifyHtaccess = function (destPath) {
    
    let sep = fm.dirSep();
    let destDist = destPath + sep + 'dist';
    
    let htaccessFiles = fm.findDirectoryItems(destDist, /.*\.htaccess$/i, 'absolute', 'files');
    
    for (let htaccessFile of htaccessFiles) {
        
        let htaccessMinified = [];
        let htaccessLines = StringUtils.getLines(fm.readFile(htaccessFile));
        
        for (let line of htaccessLines) {
            
            if(line.trim().indexOf('#') !== 0){
                
                htaccessMinified.push(line);
            }
        }
        
        fm.deleteFile(htaccessFile);
        fm.saveFile(htaccessFile, htaccessMinified.join("\n")); 
    }
    
    if(htaccessFiles.length > 0){
        
        cm.success("minify .htaccess ok");
    }
}


/**
 * Generates the code documentation for the configured languages
 */
let generateCodeDocumentation = function (destPath) {

    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    let docsPath = destPath + sep + 'docs';
    
    // Generate php doc if php build is enabled
    if(global.setup.build.lib_php){
        
        if(!fm.createDirectory(docsPath + sep + 'php', true)){
            
            cm.error('Could not create docs folder ' + docsPath + sep + 'php');
        }
        
        let phpDocExec = 'php';
        
        phpDocExec += ' "' + global.installationPaths.main + sep + 'libs' + sep + 'phpDocumentor.phar"';
        phpDocExec += ' --template="responsive-twig"';
        phpDocExec += ' --visibility="public"';
        phpDocExec += ' --title="' + setupModule.getProjectName() + "-" + setupModule.getProjectRepoSemVer() + '"';
        phpDocExec += ' -i "' + destMain + '/php/libs,autoloader.php"';
        phpDocExec += ' -d "' + destMain + sep + 'php"';
        phpDocExec += ' -t "' + docsPath + sep + 'php"';
        
        if(terminalManager.exec(phpDocExec).failed){
            
            cm.error('php doc command failed: ' + phpDocExec);
        }
        
        cm.success('php doc ok');
    }
    
    // Generate ts doc if ts build is enabled
    if(global.setup.build.lib_ts){
        
        if(!fm.createDirectory(docsPath + sep + 'ts', true)){
           
            cm.error('Could not create docs folder ' + docsPath + sep + 'ts');
        }
        
        let typeDocExec = global.installationPaths.typeDocBin;
        
        typeDocExec += ' --name ' + setupModule.getProjectName();
        typeDocExec += ' --module commonjs';
        typeDocExec += ' --mode modules';
        typeDocExec += ' --target ES5'; 
        typeDocExec += ' --options "' + destMain + sep + 'ts' + sep + 'tsconfig.json"';
        typeDocExec += ' --out "' + docsPath + sep + 'ts"';
        typeDocExec += ' "' + destMain + sep + 'ts"';
        
        let typeDocExecResult = terminalManager.exec(typeDocExec);
        
        if(typeDocExecResult.failed){
            
            cm.error('ts doc command failed: ' + typeDocExec + '\n\n' + typeDocExecResult.output);
        }
        
        cm.success('ts doc ok');
    }
}


/**
 * Generates the git changelog.txt file
 */
let createGitChangeLog = function (destPath) {
    
    buildModule.checkGitAvailable();
    
    // Define the changelog text
    let changeLogContents = setupModule.getProjectName() + ' DEV CHANGELOG ---------------------------------------------';
    
    // Get the GIT tags sorted by date ascending
    let gitTagsList = '';
    
    try{
    
        gitTagsList = execSync('git tag --sort version:refname', {stdio : 'pipe'}).toString();
        
    }catch(e){

        cm.warning("changelog failed. Not a git repository?");
        
        return;
    }
    
    // Split the tags and generate the respective output for the latest global.setup.release.gitChangeLogCount num of versions
    gitTagsList = gitTagsList.split("\n").reverse();
    
    let tags = [];
    
    for(let i=0; i < gitTagsList.length; i++){
        
        if(!StringUtils.isEmpty(gitTagsList[i])){
            
            tags.push(gitTagsList[i].replace(/\r?\n|\r/g, ""));
        }
    }
        
    changeLogContents += "\n\n";
        
    // Log the changes from the newest defined tag to the current repo state
    try{
        
        changeLogContents += execSync("git log " + tags[0] + '..HEAD --oneline --pretty=format:"%ad: %s%n%b" --date=short', {stdio : 'pipe'}).toString(); 
    
    }catch(e){

        // A tag could not be found
    }
              
    // Log all the changes for each one of the defined tags
    
    for(let i=0; i < Math.min(global.setup.release.gitChangeLogCount, tags.length); i++){
    
        changeLogContents += "\n\n\nVERSION: " + tags[i] + " ---------------------------------------------\n\n";
        
        let gitExecutionCommand = 'git '; 
    
        if(i >= (tags.length - 1)){
    
            gitExecutionCommand += "log " + tags[i] + ' --oneline --pretty=format:"%ad: %s%n%b" --date=short';
    
        }else{
    
            gitExecutionCommand += "log " + tags[i+1] + ".." + tags[i] + ' --oneline --pretty=format:"%ad: %s%n%b" --date=short';
        }
        
        changeLogContents += execSync(gitExecutionCommand, {stdio : 'pipe'}).toString();
    }
    
    // Create the changelog file
    fm.saveFile(destPath + fm.dirSep() + 'Changelog.txt', changeLogContents);
    
    cm.success("changelog ok");
}