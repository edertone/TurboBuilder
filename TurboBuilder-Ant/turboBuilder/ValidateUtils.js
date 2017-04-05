/**
 * Utility methods used by the builder validator
 */


/**
 * Load all the file contents and return it as a string
 */
function loadFileAsString(path, replaceWhiteSpaces){

	var file = new java.io.File(path);
	var fr = new java.io.FileReader(file);
	var br = new java.io.BufferedReader(fr);

	var line = "";
	var lines = "";

	while((line = br.readLine()) != null){

		if(replaceWhiteSpaces){

			lines = lines + line.replace(" ", "");

		}else{

			lines = lines + line;
		}
	}

	return lines;
}


/**
 * Get a list with all the files inside the specified path.
 * Each element on the resulting array will contain the filename and the path starting from the end of the given path.
 * For example, if we provide "src/main" as path, resulting files may be like "php/managers/BigManager.php", ... and so.
 */
function getFilesList(path){
	
	var fs = project.createDataType("fileset");

    fs.setDir(new java.io.File(path));
    fs.setIncludes("**");

    var srcFiles = fs.getDirectoryScanner(project).getIncludedFiles();
    
    var result = [];
    
    for (var i = 0; i<srcFiles.length; i++){
        
    	result.push(srcFiles[i]);
    }
    
    return result;
}


/**
 * Output to ant console the warnings and errors if exist
 */
function echoWarningsAndErrors(antWarnings, antErrors){
	
	//Define the echo task to use for warnings and errors
	var echo = project.createTask("echo");
	var error = new org.apache.tools.ant.taskdefs.Echo.EchoLevel();
	error.setValue("error");
	echo.setLevel(error);

	//Display all the detected warnings
	for(var i = 0; i < antWarnings.length; i++){

		echo.setMessage("WARNING: " + antWarnings[i]);
		echo.perform();
	}

	//Display all the detected errors
	for(i = 0; i < antErrors.length; i++){

		echo.setMessage("ERROR: " + antErrors[i]);
		echo.perform();
	}

	//Set a failure to the ant build if errors are present
	if(antErrors.length > 0){

		project.setProperty("javascript.fail.message", "Source analisis detected errors.");
	}
}