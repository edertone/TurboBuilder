# How to make the builder available to the public

1 - Update all the project dependencies if necessary
	(See the related help file for docs on how to upgrade dependencies)

2 - Launch all the project tests and make sure there are no failures
	(See the related help file for docs on how to launch tests)

3 - Review git changelog to decide the new version value based on the GIT changes: minor, major, ...

4 - Update the version number on the package.json file
	Make sure we have increased the version number regarding the previously published one

5 - Review package.json for any other desired change

6 - Review project Readme.md to reflect new features or changes

7 - Commit all changes to repo

8 - Make sure the git tag is updated with the new project version we want to publish
	(Either in git local and remote repos)

9 - Open a command line inside project folder and run:
	npm publish

10 - Verify that new version appears for the package at www.npmjs.com/~edertone
