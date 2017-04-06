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
	
	var baseDir = project.getProperty("basedir") + "/../";
	var paths = project.getProperty("Validate.CopyrightHeaders.Header").split(",");
	var appliesTo = project.getProperty("Validate.CopyrightHeaders.Header.appliesTo").split(",");
	var includes = project.getProperty("Validate.CopyrightHeaders.Header.includes").split(",");
	var excludes = project.getProperty("Validate.CopyrightHeaders.Header.excludes").split(",");
	
	for(var i = 0; i < paths.length; i++){
		
		var header = loadFileAsString(baseDir + paths[i]);
		
		var files = getFilesList(baseDir + appliesTo[i], includes[i], excludes[i]);
		
		for(var j = 0; j < files.length; j++){
			
			var file = loadFileAsString(baseDir + appliesTo[i] + "/" + files[j]);
			
			if(file.indexOf(header) != 0){
				
				antErrors.push(appliesTo[i] + "/" + files[j]  + " bad copyright header. Must be as defined in " + paths[i]);
			}
		}	
	}
}


//--------------------------------------------------------------------------------------------------------------------------------------
// Show warnings and errors if any was generated
echoWarningsAndErrors(antWarnings, antErrors);