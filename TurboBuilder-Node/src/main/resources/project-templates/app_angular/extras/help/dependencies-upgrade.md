# How to upgrade all the libraries and dependencies that this project uses


This project uses libraries and dependencies from a variety of sources. To make sure that all of them are up to date, follow this steps:

- Check if angular framework must be updated (follow the official guide)

- Open a cmd at the root of this project folder, and run:

    npm outdated
    
    Update the package.json versions based on the command result, by running:
    
      npm install libraryname1@latest libraryname2@latest libraryname3@latest
      
      npm install --save-dev libraryname1@latest libraryname2@latest libraryname3@latest (For the dev dependencies)