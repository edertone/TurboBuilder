# How to make the builder available to the public

1 - Update all the project dependencies if necessary
	(See the related help file for docs on how to upgrade dependencies)

2 - Launch all the project tests and make sure there are no failures
	(See the related help file for docs on how to launch tests)

3 - Update the version number on the package.json file and commit it.
	Make sure we have increased the version number regarding the previously published one

4 - Review package.json for any other desired change

5 - Review project Readme.md to reflect new features or changes

6 - Make sure the git tag is updated with the new project version we want to publish
	(Either in git local and remote repos)

7 - Open a command line inside project folder and run:
	npm publish

8 - Verify that new version appears for the package at www.npmjs.com/~edertone
