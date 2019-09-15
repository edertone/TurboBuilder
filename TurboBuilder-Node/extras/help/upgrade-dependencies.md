# How to upgrade all the libraries and dependencies that this project uses


This project uses libraries and dependencies from a variety of sources. To make sure that all of them are up to date, follow this steps:

- Open a cmd at the root of this project folder, and run:

    npm outdated
    
    Update the package.json versions based on the command result, by running:
    
      npm install libraryname@latest --save
      
    For each one of the outdated libraries we want to upgrade  
    
- Update all the libraries versions on:

    src\main\libs
        
        - Update the library versions at the site_php index.php file:
            src/main/resources/project-templates/site_php/src/main/index.php
    
        - Check generate.js file contents and update the library versions to match the new ones
        
    src\test\libs
        
        - Check test.js file contents to update the phpUnit and qunit versions used

- Update the dependencies on the site_php template:

    src/main/resources/project-templates/site_php/package.json
    
        - To check outdated npm libs in the site_php template, you can create an empty project by:
                
            creating some temporary folder on your pc
            running tb -g site_php
            executing npm ci
            executing npm outdated
            perform the dependencies update
            copy package.json and package-lock.json from the generated project to the project-template files
        
- Run the project tests as explained on help and make sure everything works as expected