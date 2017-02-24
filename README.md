# TurboBuilder

A general purpose project builder for the most common developer needs.

### Features
- Works on any IDE that can run Ant tasks, or via command line
- Support for multiple development languages: Js, Css, Php and Ts
- Covers the whole project development cycle: Build, deploy, validate, test and production release
- Automatic deploy to a remote ftp location
- Automatic deploy to a localhost location
- Automatic merging of all the project javascript files to a single .js
- Automatic php phar generation
- Automatic version number generation
- Automatic database creation / deletion
- Automatic jsdoc and phpdoc generation
- Automatic js, css, html and php minification
- Automatic images compression and optimitzation for jpg and png files
- Automatic git changelog generation
- Automatic project structure and conventions validation
- Run unit tests for Php and JS as part of the build process

All of the listed features can be enabled or disabled via the main [TurboBuilder.xml](TurboBuilder-Ant/TurboBuilder.xml) file.

### How to use it

TurboBuilder is currently based on [Apache Ant](http://ant.apache.org). You should be familiar with it to setup and run the builder tasks. Follow the next steps to configure your project:

- [Download the latest version](https://github.com/edertone/TurboBuilder/archive/master.zip)

- Install the command line utilities that are required by the builder. You can find them inside the TurboBuilder-Tools/ folder. There is also a [Readme.txt](TurboBuilder-Tools/README.txt) file with detailed information on how to install the tools on your computer.

- Create a .turboBuilder folder at the root of your project and copy there all the files from [TurboBuilder-Ant/turboBuilder/](TurboBuilder-Ant/turboBuilder/).

- Create a TurboBuilder.xml file at the root of your project to configure the build process. You can use [this template](TurboBuilder-Ant/TurboBuilder.xml) as a starting point. You must change all the parameters inside the file depending on your build needs.

- make sure that your project is organized with the following directories structure:
  ```
  MyProjectFolder
  │   TurboBuilder.xml
  │
  ├───src
  │   ├───main
  │   │   ├───css
  │   │   ├───js
  │   │   ├───php
  │   │   │       AutoLoader.php
  │   │   │
  │   │   ├───resources
  │   │   └───ts
  │   └───test
  │       ├───js
  │       └───php
  │               AutoLoader.php
  │               index.php
  │
  └───.turboBuilder
          Build.xml
          BuildSetupSchema.xsd
  ```

- Execute the .turboBuilder/Builder.xml ant script with your favourite IDE or command line as part of your project build process. There are two ant targets that can be executed: 'build' and 'clean'. The first one builds the project to the /target folder, and the second one performs the built files cleanup (basically deletes the target). If everything works as expected, the builder will read the parameters from TurboBuilder.xml setup and perform all of the specified operations.

### Update an existing project

You can easily update TurboBuilder on a project that is already using it by executing the provided .turboBuilder/Update.xml ant script file. Simply run the script and it will launch it's default task that will download the latest versions of the files to your project folder.


### Dependencies

Following are mandatory:
- Windows OS (Not tested on linux)
- Apache Ant

Following are only necessary if we want to use the respective feature:
- mysql.exe
- jsdoc.cmd
- nodeJs
- php.exe

The following tools are bundled inside the TurboBuilder-Tools package:
- yuicompressor-2.4.7
- htmlcompressor-1.5.3.jar
- pngquant.exe
- optipng.exe
- jpegtran.exe
- W3c-css-validator
- PhpDocumentor

To enable ant Ftp support, you must add apache commons to ant's include path.
Download it here: http://commons.apache.org/net/index.html

### Support
TurboBuilder is 100% free and open source. But we will be really pleased to receive any help, support, comments or donations to improve it. If you find any bug on your enviroment or OS, please tell us so we can improve the script.

[![Donate](http://turbocommons.org/resources/shared/images/DonateButton.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53MJ6SY66WZZ2&lc=ES&item_name=TurboCommons&no_note=0&cn=A%c3%b1adir%20instrucciones%20especiales%20para%20el%20vendedor%3a&no_shipping=2&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)
