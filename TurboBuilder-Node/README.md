# TurboBuilder

Command line tool with a massive amount of features to help with daily development tasks: build projects, run unit tests, generate docs, upload to ftp, compress images, detect duplicate code, force copyright headers, start / stop docker containers, and many more features

## Main features

- Runs via node command line
- Totally configurable with a single turbobuilder.json setup file
- Build projects with several languages: JavaScript, Typescript, Php, Css, Java
- Covers the whole project development cycle: Build, deploy, validate, test and generate a production release

### Build features

- Improved node cmd projects building process
- Compiles source code for several modern languages
- Compile turbosite projects to create fully featured websites or webservices
- Compile php libraries as a single phar file
- Compile java libraries as a single jar file
- Compile js libraries as a single .js file (generate the ES4, ES5 and ES6 versions at the same time)
- Compile typescript libraries with output to typescript, ES5, ES6, etc...
- Improved building process for Angular applications (typescript)
- Improved building process for Angular libraries (typescript)
- Automatic version number generation
- Automatically manages docker containers required by the project
- Generates a 'target' folder containing all the results of the build

### Deploy features

The following deploy operations can be enabled and customized via the turbobuilder.json setup file:

- Automatically upload the compiled project files into a remote ftp location
- Automatically copy the compiled project files into a local folder location

### Validate features

The following validations can be customized via the turbobuilder.json setup file:

- Automatic project structure and conventions validation
- Prevent the existence of tabulation characters on the project files
- Detect copy pasted code on the project and launch build warnings or build errors if necessary
- Verify that all project source code files have all the same copyright header based on a template
- Perform extra validation rules to css style sheets as part of the build process
- Namespace validation for the languages that support it (Make sure all the declared namespaces follow the same rules)
- Force use strict on all javascript files
- Several custom extra validations for angular applications

### Test features

- Run unit tests as part of the build process (for supported languages)
- Execute php unit tests with the PhpUnit library
- Execute javascript unit tests with the jasmine library
- Execute javascript unit tests with the Qunit library

### Release features

- Automatic merging of all the project javascript or typescript files to a single .js
- Php phar generation
- Java jar generation
- Typescript transpilation to one or more javascript language versions at the same time
- Js, css, html and php minification
- Generate git changelog as part of the production release compilation
- Automatic images compression and optimitzation for jpg and png files
- Generate project documentation automatically for several languages: Php, Typescript, ... 

## How to use it

### Install the cmd tool

TurboBuilder is based on nodejs but you only need basic terminal command line execution knowledge to run it. To install the turbobuilder cmd executable, follow these steps:

1. Install the latest NodeJs version on your computer

2. Open a terminal and run **npm install -g turbobuilder** to get the latest version 

### Generate a new empty project

TODO

### Turbobuilder expected project structure

For the turbobuilder application to work, it expects to be run on a project that matches the following structure:

  ```
  MyProjectFolder
  │   turbobuilder.json
  │
  ├───extras
  │   ├───help
  │   └───todo
  ├───src
  │   ├───main
  │   └───test
  ```

### Configure the turbobuilder.json file on for the project

TODO

### Validate the project

TODO

### Build the project

TODO

### Test the project

TODO

### Generate a release production version of the project

TODO


## Support

TurboBuilder is 100% free and open source, but we will be really pleased to receive any help, support, comments or donations to improve it. If you find any bug on your enviroment or OS, please tell us so we can improve the tool.

### Donate
    
[![Donate](https://turboframework.org/view/views/home/donate-button.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53MJ6SY66WZZ2&lc=ES&item_name=TurboCommons&no_note=0&cn=A%c3%b1adir%20instrucciones%20especiales%20para%20el%20vendedor%3a&no_shipping=2&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)
