'use strict';

/**
 * this module contains all the code related to the build process
 */


const { FilesManager } = require('turbocommons-ts');
const { execSync } = require('child_process');
const console = require('./console');
const validateModule = require('./validate');


let fm = new FilesManager(require('fs'), require('os'), require('path'), process);


/**
 * Generate the project folders and files on the current runtime directory
 */
exports.createProjectStructure = function () {
    
    // Create src folder
    if(!fm.createDirectory(global.runtimePaths.src)){
        
        console.error('Failed creating: ' + global.runtimePaths.src);
    }
    
    // Create main folder
    if(!fm.createDirectory(global.runtimePaths.main)){
    
        console.error('Failed creating: ' + global.runtimePaths.main);
    }
    
    // Create main resources folder
    if(!fm.createDirectory(global.runtimePaths.mainResources)){
        
        console.error('Failed creating: ' + global.runtimePaths.mainResources);
    }
    
    // Create test folder
    if(!fm.createDirectory(global.runtimePaths.test)){
        
        console.error('Failed creating: ' + global.runtimePaths.test);
    }
    
    // Create extras folder
    if(!fm.createDirectory(global.runtimePaths.extras)){
        
        console.error('Failed creating: ' + global.runtimePaths.extras);
    }
    
    console.success('Created all folders ok');
    
    // Create readme file
    if(!fm.copyFile(global.installationPaths.mainResources + fm.dirSep() + global.fileNames.readme,
                    global.runtimePaths.root + fm.dirSep() + global.fileNames.readme)){
        
        console.error('Failed creating: ' + global.runtimePaths.root + fm.dirSep() + global.fileNames.readme);
    }
    
    // Create todo file
    if(!fm.copyFile(global.installationPaths.mainResources + fm.dirSep() + global.fileNames.todo,
                    global.runtimePaths.extras + fm.dirSep() + global.fileNames.todo)){
        
        console.error('Failed creating: ' + global.runtimePaths.extras + fm.dirSep() + global.fileNames.todo);        
    }
    
    console.success('Created all files ok');
    
    console.success('Generated project structure ok');
}


/**
 * Checks that all the required cmd tools are available and can be executed
 */
let verifyToolsAvailable = function () {

	// TODO - check if this is necessary or not, cause we will use node dependencies
    console.log(execSync(global.installationPaths.typeScriptBin + ' -v', {stdio : 'pipe'}).toString());
    
    console.log(execSync(global.installationPaths.typeDocBin + ' -v', {stdio : 'pipe'}).toString());
    
    // Check that typescript compiler is available
//    if(global.setupBuild.Ts.enabled){
//        
//        try{
//            
//            execSync('tsc -v', {stdio : 'pipe'});
//            
//        }catch(e){
//
//            console.error('Could not find Typescript compiler (tsc). Run: npm install -g typescript');
//        }
//    }
}


/**
 * Copy all the project src/main files to the target folder. Any unwanted files/folders are excluded
 */
let copyMainFiles = function () {
    
    // Delete all files inside the target/projectName except the main folder one
    fm.deleteDirectory(global.runtimePaths.target + fm.dirSep() + global.runtimePaths.projectName);
    /*
    <!-- Delete all files inside the target/projectName except the main folder one -->
    <delete failonerror="false" includeemptydirs="true">
        <fileset dir="${targetFolderPath}/${projectBaseName}" casesensitive="false">
            <include name="** / *"/>
            <exclude name="main/"/>
        </fileset>
    </delete>

    <!-- Update the target/projectName/main folder with the current project state -->
    <sync todir="${targetFolderPath}/${projectBaseName}/main" overwrite="true">
        <fileset dir="${mainFolderPath}" casesensitive="false">
            <exclude name="** /thumbs.db**" />
            <exclude name="**  /.svn/**" />
            <exclude name="** /.git**" />
        </fileset>
    </sync>

    <!-- Replace the string @@package-build-version@@ on all the files with the real build version number -->
    <replace dir="${targetFolderPath}/${projectBaseName}" token="@@package-build-version@@" value="${Build.versionNumber}.${build.number}" >
        <exclude name="** /resources/"/>
    </replace>*/
}


/**
 * Execute the typescript build process
 */
let buildTypeScript = function () {
    
    let execResult = execSync('tsc', {stdio : 'pipe'});
    
    console.log(execResult.toString());
    
    // TODO
}


/**
 * Execute the build process
 */
exports.execute = function () {
  
    verifyToolsAvailable();
    
    copyMainFiles();
    
    if(global.setupValidate.runBeforeBuild){
        
        validateModule.execute();
    }
    
    if(global.setupBuild.Ts.enabled){
    
        buildTypeScript();
    }
    
    console.log('build done');
};