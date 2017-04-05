/**
 * This is the script that performs all the enabled turbo builder validations
 */


// Import Validate Utils
load(project.getProperty("basedir") + '/ValidateUtils.js');


/** Array that will contain all the warnings detected by this script and will be displayed at the end */
var antWarnings = [];

/** Array that will contain all the errors detected by this script and will be displayed at the end */
var antErrors = [];


//--------------------------------------------------------------------------------------------------------------------------------------
// Apply the ProjectStructure rule if enabled
if(project.getProperty("Validate.ProjectStructure.enabled") === "true"){
	
	// TODO
}


//--------------------------------------------------------------------------------------------------------------------------------------
// Apply the Css rule if enabled
if(project.getProperty("Validate.Css.enabled") === "true"){
	
	// TODO
}


// --------------------------------------------------------------------------------------------------------------------------------------
// Apply the CopyrightHeaders rule if enabled
if(project.getProperty("Validate.CopyrightHeaders.enabled") === "true"){
	
	var paths = project.getProperty("Validate.CopyrightHeaders.Header").split(",");
	var appliesTo = project.getProperty("Validate.CopyrightHeaders.Header.appliesTo").split(",");
	
	for(var i = 0; i < paths.length; i++){
		
		var header = loadFileAsString(project.getProperty("basedir") + "/../" + paths[i]);
		
		var files = getFilesList(project.getProperty("basedir") + "/../" + appliesTo[i]);
		
		for(var j = 0; j < files.length; j++){
			
			var file = loadFileAsString(project.getProperty("basedir") + "/../" + appliesTo[i] + "/" + files[j]);
			
			if(file.indexOf(header) != 0){
				
				antErrors.push(files[j]  + " bad copyright header. Must be as defined in " + paths[i]);
			}
		}	
	}
}


//--------------------------------------------------------------------------------------------------------------------------------------
// Show warnings and errors if any was generated
echoWarningsAndErrors(antWarnings, antErrors);