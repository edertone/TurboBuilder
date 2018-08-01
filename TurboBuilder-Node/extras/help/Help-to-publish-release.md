# How to make the builder available to the public

1 - Update the version number on the package.json file and commit it

2 - Make sure the git tag is updated with the new project version we want to publish
	(Either in git local and remote repos)

3 - Launch all the project tests and make sure there are no failures
	(See the related help file for docs on how to launch tests)
	
4 - Review package.json for any other desired change 

5 - Open a command line inside project folder and run:
	npm publish

6 - Verify that new version appears for the package at www.npmjs.com/~edertone
