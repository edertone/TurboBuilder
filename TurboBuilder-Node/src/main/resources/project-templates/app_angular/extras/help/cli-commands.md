# Building ANGULAR app with turbobuilder

## Build and verify the application

TODO

## Build a release version

TODO


# frequently used ANGULAR (ng) cmd commands


## Launch a live development server

Run `ng serve` to launch a real time updating development server with your app

## Build the application

Run `ng build`. This will create a my-app-name folder inside the target folder, containing the compiled application

## Build the application for production

Run `ng build --prod`. This will create a my-app-name folder inside the target folder, containing the production ready application


# frequently used NPM cmd commands


## Generate a node_modules folder strictly from package-lock file contents

If we have checkout a new project form a repo and we want to get exactly the dependencies state as it is expected on its package-lock file, we must use:

`npm ci`

We will use npm install or update only if we want to modify the dependency tree of the project (update dependency versions, remove unused ones, etc...)