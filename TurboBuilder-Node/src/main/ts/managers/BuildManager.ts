/**
 * TurboCommons is a general purpose and cross-language library that implements frequently used and generic software development tasks.
 *
 * Website : -> http://www.turbocommons.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import * as fs from 'fs';

        
/**
 * Main class that controls all the build process
 */ 
export class BuildManager{

    
    private projectBaseName = '';
    
    private srcFolderPath  = "src";
    
    private mainFolderPath = "src/main";
    
    private targetFolderPath = "target";

    private xmlSetup = [];
    
    /**
     * TODO
     */
    public run() {
    
        this.loadSetupFromXml();
        
        this.getLatestGitTag();
        
        // TODO - this.loadOneTimeProperties(); aixo putser es podria barrejar amb el xml de configuracio, modificar-ho alla directament
        
        this.defineDefaultSetupValues();
        
        this.validateBuiderToolsAreAvailable();
        
        this.increaseAndGetBuildNumber();
        
        this.copyMainFiles();
        
        if(this.xmlSetup["Validate.enabled"] == "true"){
            
            this.validateProject();
        }
                
        if(this.xmlSetup["Build.Php.enabled"] == "true"){
            
            this.buildPhp();
        }
        
        if(this.xmlSetup["Build.Java.enabled"] == "true"){
        
            this.buildJava();
        }
    }
    
    
    /**
     * TODO
     */
    private loadSetupFromXml(){
        
        fs.readFile('turbobuilder.xml', 'utf8', (error, data) => {
            
            console.log('error');
        });
        
        // TODO - validate the xml setup
    }
    
    
    /**
     * Get the latest tag if defined on GIT and not specified on TurboBuilder.xml
     */
    private getLatestGitTag(){
        
    }
    
    
    /**
     * Set default values for some properties in case they are not specified on the TurboBuilder.xml 
     */
    private defineDefaultSetupValues(){
        
    }
    
    
    /**
     * TurboBuilder-Tools folder must exist
     */
    private validateBuiderToolsAreAvailable(){
        
    }
    
    
    /**
     * Increase the project build number. 
     * We will increase it even if the build fails, to prevent overlapping files from different builds.
     * (Note that this file will be auto generated if it does not exist)
     */
    private increaseAndGetBuildNumber(){
        
    }
    
    
    private copyMainFiles(){
        
    }
    
    
    private validateProject(){
        
    }
    
    
    private buildPhp(){
        
    }
    
    
    private buildJava(){
        
    }
}
