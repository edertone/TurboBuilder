'use strict';

/**
 * this module contains all the code related to the build process
 */


const { FilesManager } = require('turbocommons-ts');
const console = require('./console');
const validateModule = require('./validate');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);
let buildPath = global.runtimePaths.targetProjectName;


//We will delete the unpacked src files when application exits, may it be due to a 
//success or an error
process.on('exit', () => {

    if(!global.setupBuild.keepUnpackedSrcFiles){
        
        this.removeUnpackedSrcFiles(buildPath);
    }
});


/**
 * Get a string with the current project version
 */
exports.getCurrentVersion = function () {
    
    return 'MAJOR' + "." + 'MINOR' + '.' + 'PATCH'
}


/**
 * Copy all the project src/main files to the target folder. Any unwanted files/folders are excluded
 */
exports.copyMainFiles = function (destPath) {
    
    // If source file is empty, alert the user
    if(fm.findDirectoryItems(global.runtimePaths.main, /.*/i, 'relative', 'files').length === 0){
        
        console.error('no files to build');
    }
    
    let destMain = destPath + fm.dirSep() + 'main';
    
    // Copy the main folder to the target
    fm.createDirectory(destMain, true);
    
    // Ignore all the following files: thumbs.db .svn .git
    // TODO let filesToCopy = fm.findDirectoryItems(global.runtimePaths.main, /^(?!.*(thumbs\.db|\.svn|\.git)$)/i, 'absolute', 'files');
    
    // TODO fm.copyFiles(filesToCopy, global.runtimePaths.targetProjectName + fm.dirSep() + 'main');
    
    fm.copyDirectory(global.runtimePaths.main, destMain);
    
    // TODO - Replace the string @@package-build-version@@ on all the files with the real build version number
}


/**
 * Execute the typescript build process to the specified dest folder
 */
exports.buildTypeScript = function (destPath) {
    
    let sep = fm.dirSep();
    let destMain = destPath + sep + 'main';
    let destDist = destPath + sep + 'dist';
    let tsConfig = destMain + sep + 'ts' + sep + 'tsconfig.json';
    
    // Create a default tsconfig file if there's no specific one
    if (!fm.isFile(tsConfig) &&
        !fm.createFile(tsConfig, '{"compilerOptions":{"target": "es5"}}')) {
        
        console.error('Could not create ' + tsConfig);
    }
    
    // Generate the Typescript compatible dist version
    let tsExecution = global.installationPaths.typeScriptBin;
        
    tsExecution += global.setupBuild.Ts.compilerStrict ? ' --strict' : '';
    tsExecution += global.setupBuild.Ts.compilerDeclarationFile ? ' --declaration' : '';
    tsExecution += global.setupBuild.Ts.compilerSourceMap ? ' --sourceMap' : '';
    
    tsExecution += ' --alwaysStrict';             
    tsExecution += ' --target ES6';
    tsExecution += ' --outDir "' + destDist + sep + 'TS"';
    tsExecution += ' --module commonjs';
    tsExecution += ' --rootDir "' + destMain + sep + 'ts"';      
    tsExecution += ' --project "' + destMain + sep + 'ts"';     
    
    console.exec(tsExecution, 'ts compiled ok');
    
    // Generate the javascript single file versions
    tsExecution = global.installationPaths.typeScriptBin;
    let targets = global.setupBuild.Ts.CompilerTarget;
    
    for(var i=0; i < targets.length; i++){
        
        let tmpFolder = destDist + sep + targets[i].target + sep + 'tmp';
        let mergedFileName = (targets[i].mergedFileName == '' ? global.runtimePaths.projectName : targets[i].mergedFileName) + '.js';
        
        // Compile the typescript project with the current JS target into a temp folder
        tsExecution += global.setupBuild.Ts.compilerStrict ? ' --strict' : '';
        tsExecution += global.setupBuild.Ts.compilerDeclarationFile ? ' --declaration' : '';
        tsExecution += global.setupBuild.Ts.compilerSourceMap ? ' --sourceMap' : '';

        tsExecution += ' --alwaysStrict';             
        tsExecution += ' --target ' + targets[i].target;
        tsExecution += ' --outDir "' + tmpFolder + '"';
        tsExecution += ' --module commonjs';
        tsExecution += ' --rootDir "' + destMain + sep + 'ts"';      
        tsExecution += ' --project "' + destMain + sep + 'ts"';                          
        console.exec(tsExecution);

        // Generate via webpack the merged JS file for the current target       
        let webPackExecution = global.installationPaths.webPackBin;
        
        webPackExecution += ' "' + tmpFolder + sep + 'index.js"';
        webPackExecution += ' "' + destDist + sep + targets[i].target + sep + mergedFileName + '"';
        webPackExecution += ' --output-library ' + targets[i].globalVar;                            
        
        if(global.setupBuild.Ts.compilerSourceMap){
            
            fm.createFile(tmpFolder + sep + 'webpack.config.js', "module.exports = {devtool: 'source-map'};");
            
            webPackExecution += ' --config "' + tmpFolder + sep + 'webpack.config.js"';     
        }

        console.exec(webPackExecution, 'Webpack ' + targets[i].target + ' ok');

        // Delete temp folder
        fm.deleteDirectory(tmpFolder);
    }
}


/**
 * Delete all the src main files that exist on target folder
 */
exports.removeUnpackedSrcFiles = function (destPath) {

    let destMain = destPath + fm.dirSep() + 'main';
    
    // Delete the files from the non production folder
    if(fm.isDirectory(destMain) && !fm.deleteDirectory(destMain)){
        
        console.error('Could not delete unpacked src files from ' + destMain);
    }
    
    // TODO - delete unpacked files from
    // <delete dir="${targetFolderPath}/${projectBaseName}-${Build.versionNumber}.${build.number}/main" failonerror="false" />
}


/**
 * Execute the build process
 */
exports.execute = function () {

    console.log("\nbuild start");
    
    // TODO
    // Read the build number from file, increase it and save it.
    // We will increase it even if the build fails, to prevent overlapping files from different builds.
    // (Note that this file will be auto generated if it does not exist)
    
    // Delete all files inside the target/projectName folder
    fm.deleteDirectory(buildPath);
    
    // Copy all the src main files to the target dev build folder
    this.copyMainFiles(buildPath);
    
    if(global.setupValidate.runBeforeBuild){
        
        validateModule.execute();
    }
    
    if(global.setupBuild.Ts.enabled){
    
        this.buildTypeScript(buildPath);
    }
    
    console.success('build ok');
};