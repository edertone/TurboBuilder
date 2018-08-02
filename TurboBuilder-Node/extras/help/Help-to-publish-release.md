# How to make the builder available to the public

1 - Launch all the project tests and make sure there are no failures
	(See the related help file for docs on how to launch tests)

2 - Update the version number on the package.json file and commit it.
	Make sure we have increased the version number regarding the previously published one

3 - Review package.json for any other desired change

4 - Review project Readme.md to reflect new features or changes

5 - Make sure the git tag is updated with the new project version we want to publish
	(Either in git local and remote repos)

6 - Open a command line inside project folder and run:
	npm publish

7 - Verify that new version appears for the package at www.npmjs.com/~edertone
