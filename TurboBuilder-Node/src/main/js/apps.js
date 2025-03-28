'use strict';

/**
 * this module contains all the code related to the applications and utilities used by turbobuilder
 */


const { FilesManager } = require('turbodepot-node');
const { ConsoleManager } = require('turbodepot-node');
const { TerminalManager } = require('turbodepot-node');
const { execSync } = require('child_process');
const { spawn } = require('child_process');
const setupModule = require('./setup');
const releaseModule = require('./release');

const fm = new FilesManager();
const cm = new ConsoleManager();
const terminalManager = new TerminalManager();


/**
 * Stop active docker containers on process exit if necessary
 */
process.on('exit', () => {
    
    if(dockerProjectInstanceName !== '' && stopDockerProjectContainersOnExit){
        
        this.stopDockerProjectContainers();
    }
});


/**
 * Stores the project name for the currently active multi-container docker instance
 * It will be filled after the docker instances are initialized
 */
let dockerProjectInstanceName = '';


let isGitAvailable = false;


let isWinSCPAvailable = false;


let stopDockerProjectContainersOnExit = true;


/**
 * Get the name for the currently active Project docker multi container instance
 */
exports.getDockerProjectInstanceName = function () {

    return dockerProjectInstanceName;
}


/**
 * This method is meant to be executed at the start of turbobuilder. 
 * It will check the docker containers policy and launch them inmediately if "startPolicy" is "all"
 */
exports.checkContainersStartPolicy = function () {

    // if no docker container is specified, nothing to do
    if(!global.setup.containers ||
       global.setup.containers.docker.length <= 0){
        
        return;
    }

    if(global.setup.containers.docker[0].startPolicy === "always"){
        
        this.startDockerProjectContainers();
    }
}


/**
 * Initializes the docker containers for the current project if necessary
 * 
 * @param {boolean} showContainerReadme - If true, the contents of the readme file inside the docker containers folder will be output by the console
 * @param {boolean} stopOnExit - If true, the docker containers will be stopped on process exit
 * 
 * @returns {number} - 1 if the docker containers were started successfully, 0 otherwise
 */
exports.startDockerProjectContainers = function (showContainerReadme = false, stopOnExit = true) {

    // If the docker containers are already started, nothing to do
    if(dockerProjectInstanceName !== ''){
        
        return 0;
    }
    
    // if no docker container is specified, nothing to do
    if(global.setup.containers.docker.length <= 0){
        
        return 0;
    }
    
    // Get the path value specified for the first docker container
    // TODO - only a single docker container is working right now
    let dockerSetupPath = global.setup.containers.docker[0].path;
    
    let result; 
    let containerPath = '';
     
    // Check if the docker container on setup is a bundled one or a custom one   
    if(!dockerSetupPath.startsWith('./')){
        
        let bundledTemplatesPath = global.installationPaths.mainResources + '/docker';
        let listOfTemplatesAvailable = fm.getDirectoryList(bundledTemplatesPath);
        
        if(!listOfTemplatesAvailable.includes(dockerSetupPath)){
            
            cm.error(`invalid Docker container template name '${dockerSetupPath}'. Must be one of the following:\n` + listOfTemplatesAvailable.join('\n'));
        }
            
        containerPath = bundledTemplatesPath + '/' + dockerSetupPath;

        cm.text(`\nDocker start containers (${dockerSetupPath})`);
        
        let distFolderAbsolutePath = global.runtimePaths.target;
        
        if(global.isRelease){
        
            distFolderAbsolutePath += '/' + releaseModule.getReleaseRelativePath();  
        
        }else{
            
            distFolderAbsolutePath = global.runtimePaths.target + '/' + setupModule.getProjectName();
        }

        // Mount the docker containers from the turbobuilder installation default templates
        // Notice that we are dinamically providing the value for the project target folder via environment variables.
        // We also assign a project name via -p so we can refer to this multicontainer everywhere via its name instead of its path
        result = terminalManager.exec(`docker compose -f "${containerPath}/docker-compose.yaml" -p ${dockerSetupPath} up -d`, false, {
            'PROJECT_TARGET_FOLDER': global.runtimePaths.target,
            'PROJECT_DIST_FOLDER': distFolderAbsolutePath + '/dist',   
            'DOCKER_RESTART_POLICY': 'no'   
        });
        
        dockerProjectInstanceName = dockerSetupPath;
            
    }else{
        
        // TODO - this seems to be not working properly
        cm.text(`\nDocker start project custom containers`);
               
        // Mount the docker containers on the project extras directory
        result = terminalManager.exec(`docker compose -p ${setupModule.getProjectName()} up -d`);
        
        dockerProjectInstanceName = setupModule.getProjectName();
    }
      
    if(result.failed){
        
        cm.error('Docker failed: \n' + result.output);
    
    }else{
    
        // Check if we should output the contents of the readme file inside the docker containers folder
        let readmeFile = containerPath + fm.dirSep() + 'README.txt';
                    
        if(showContainerReadme && fm.isFile(readmeFile)){
            
            cm.success('\n' + fm.readFile(readmeFile));            
        }

        // Set the flag to stop the docker containers on process exit if necessary
        // This is useful to avoid leaving the containers running after the process is done
        stopDockerProjectContainersOnExit = stopOnExit;
        
        cm.text(`\nDocker containers started successfully`);
        cm.success('ok');
        
        return 1;  
    }
}


/**
 * Stops the docker containers for the current project
 * 
 * @param {boolean} force - If true, the docker container specified on the turbobuilder setup file will be stopped regardless of the current state
 */
exports.stopDockerProjectContainers = function (force = false) {

    if(global.setup.containers.docker.length < 1 || dockerProjectInstanceName === ''){
    
        if(force){
        
            dockerProjectInstanceName = global.setup.containers.docker[0].path;    

        }else{
            
            return;
        }        
    }
        
    cm.text('\nDocker stop containers (please wait)');
      
    let result = terminalManager.exec(`docker compose -p ${dockerProjectInstanceName} down -v`);
      
    if(result.failed){
       
        cm.error('Docker failed:\n' + result.output);
    
    }else{
    
        dockerProjectInstanceName = '';
        cm.success('ok');    
    }
}


/**
 * Check if the WinSCP cmd executable is available or not on the system
 */
exports.checkWinSCPAvailable = function () {

    if(!isWinSCPAvailable){
        
        try{
            
            execSync('winscp /help', {stdio : 'pipe'});
            
            isWinSCPAvailable = true;
            
        }catch(e){

            cm.error('Could not find winscp cmd executable. Please install winscp and make sure is available globally via cmd (add to PATH enviroment variable if necessary) to perform sync operations');
        }
    }
}


/**
 * Check if the git cmd executable is available or not on the system
 */
exports.checkGitAvailable = function () {

    if(!isGitAvailable){
        
        try{
            
            execSync('git --version', {stdio : 'pipe'});
            
            isGitAvailable = true;
            
        }catch(e){

            cm.warning('Warning: Could not find GIT cmd executable. Please install git on your system and make sure it is globally accessible via cmd');
        }
    }
}


/**
 * Check if the git cmd executable is available or not on the system
 */
exports.callPhpCmd = function (cmdString, liveOutput = false) {

    this.startDockerProjectContainers();
    
    const result = terminalManager.exec(`docker compose -p ${dockerProjectInstanceName} exec web-app php ${cmdString}`, liveOutput);
       
    if(result.failed){
        
        throw new Error("Php cmd call failed: " + result.output);
    }
    
    return result;
}


/**
 * Initiate an http server instance using the project target folder as the root.
 * If a server is already using the currently configured port, the new instance will not start.
 * This is useful cause we will be able to leave the created http server instance open all the time
 * while we perform different test executions
 */
exports.launchHttpServer = function (root, port) {
    
    // Initialize an http server as an independent terminal instance, with the dest folder as the http root
    // and with the cache disabled. It will silently fail if a server is already listening the configured port
    let httpServerCmd = global.installationPaths.httpServerBin;
    
    httpServerCmd += ' "' + root + '"';
    httpServerCmd += ' -c-1';
    httpServerCmd += ' -p ' + port;
    
    spawn(httpServerCmd, [], {shell: true, stdio: 'ignore', detached: true}).unref();    
   
    cm.success('started http-server');
}


/**
 * This is a function that performs a hardblock of the current execution till the provided function returns a true value or
 * the provided number of miliseconds is complete
 */
exports.blockingSleepTill = function (verificationFun, maxTimeMs, timeExceededErrorMessage) {

    let currentTime = Date.now();
    
    while(Date.now() < currentTime + maxTimeMs){
        
        if(verificationFun()){
        
            return;
        }
    }
    
    cm.error(timeExceededErrorMessage);
}