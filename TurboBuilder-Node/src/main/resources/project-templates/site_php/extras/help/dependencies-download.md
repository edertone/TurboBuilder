# How to download all the libraries and dependencies that this project uses


This project uses libraries and dependencies from a variety of sources. To download them so the project can work, do the following:

- Open a cmd at the root of this project folder, and run:

    - To download all the node dependencies:
        - npm ci
       
    - To download all the PHP dependencies:
        - composer install
    

Node dependencies will go to node_modules and PHP dependencies to vendor folder