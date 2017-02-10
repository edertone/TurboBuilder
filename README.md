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

All of the listed features can be enabled or disabled via the main Setup-Build.xml file.

### How it works
Turbo builder is based on Apache Ant, but we don't discard translating it to another build tool if necessary.

To build a project with turbo builder, you must do the following:

- Create a .turboBuilder folder at the root of your project and copy there all the files from this_repository/turboBuilder folder

- Create a Setup-Build.xml file at the root of your project. You can use the template that is found on this repository as a starting point. You must define all the parameters inside the file depending on your build needs.

- Execute the .turboBuilder/Builder.xml with ant, via your favourite IDE or command line. There are two ant targets that can be executed: 'build' and 'clean'. The first one builds the project to a /target folder, and the second one performs the built files cleanup. If everything works as expected, the builder will read the parameters from Setup-build.xml and perform all of the operations defined there.

Note: To enable ant Ftp support, you must add apache commons to ant's include path. Download it here: http://commons.apache.org/net/index.html

### Dependencies

Following are mandatory:
- Windows OS (Not tested on linux)
- Apache Ant

Following are only necessary if we want to use the respective feature:
- yuicompressor-2.4.7
- htmlcompressor-1.5.3.jar
- pngquant.exe
- optipng.exe
- jpegtran.exe
- W3c-css-validator
- mysql.exe
- PhpDocumentor
- jsdoc.cmd
- nodeJs
- php.exe

Paths to all of these tools must be defined under the tag \<Tools\> at the Setup-build.xml file

### Support
Turbo builder is 100% free and open source. But we will be really pleased to receive any help, support, comments or donations to improve it. If you find any bug on your enviroment or OS, please tell us so we can improve the script.

[![Donate](http://turbocommons.org/resources/shared/images/DonateButton.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53MJ6SY66WZZ2&lc=ES&item_name=TurboCommons&no_note=0&cn=A%c3%b1adir%20instrucciones%20especiales%20para%20el%20vendedor%3a&no_shipping=2&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)
