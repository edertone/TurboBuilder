# How to upgrade all the libraries and dependencies that this project uses


This project uses libraries and dependencies from a variety of sources. To make sure that all of them are up to date, follow this steps:

- Open a cmd at the root of this project folder, and run:

    npm outdated
    
    Update the package.json versions based on the command result, by running:
    
      npm install libraryname@latest
      
    For each one of the outdated libraries we want to upgrade
    
- Check that all libraries on:
    src\main\libs
    correspond to their latests versions
    
- Update the library versions at the index.php file:
    src/main/index.php
        
- Run the project tests and make sure everything works as expected