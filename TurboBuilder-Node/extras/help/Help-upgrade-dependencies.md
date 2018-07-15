# How to upgrade all the libraries and dependencies that this project uses

This project uses libraries and dependencies from a variety of sources. To make sure that all of them are up to date, follow this steps:

- Open a cmd at the root of this project folder, and run:
	npm outdated
	Update the package.json versions based on the command result
	
- Check that all libraries on:
	src\main\resources\libs
	correspond to their latests versions
	
	src\test\resources\libs
	correspond to their latests versions

- Check generate.js file contents and update the library versions to match the new ones

- Run the project tests as explained on help and make sure everything works as expected