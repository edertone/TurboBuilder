# frequently used NPM cmd commands


## Run script without installing it globally

node ./src/main/js/index.js

## Generate a node_modules folder strictly from package-lock file contents

If we have checkout a new project form a repo and we want to get exactly the dependencies state as it is expected on its package-lock file, we must use:

npm ci

We will use npm install or update only if we want to modify the dependency tree of the project (update dependency versions, remove unused ones, etc...) 

## Update all the package.json dependencies versions

If we want to put our package.json dependencies to their latest versions, we will use:

npm update

## Install the project globally to execute in development via cmd "turbobuilder" "tb"

npm install -g

## Uninstall the project globally (we stop developing it)

npm uninstall -g

## List all the globally installed packages

npm ls -g --depth 0

## List outdated global packages

npm -g outdated

## List outdated project packages

npm outdated

## Update an already installed global package

npm i -g <packagename>

## Update an already installed project package

- It can be done by modifying the package.json version and running npm install

## Generate a tarball equal to the published one

This will generate a compressed file with the samen contents that will be published to npm, so you can inspect
it to see that everything is fine:

npm pack

Then you can test this generated tarball file by installing it in your system like:

npm install somezipfile-0.0.4.tgz
npm install -g somezipfile-0.0.4.tgz

## Publish the project to NPM

npm publish