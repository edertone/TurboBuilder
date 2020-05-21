The storage folder is the place where we store all our application data (With the exception of anything that may be stored by the database engine).

The specific contens for each folder are detailed next:


- cache

    Contains all the data which may be temporarily or undefinitely cached by our application. It is normally safe to delete the folder contents.
    at any time we want.

- custom

    This folder has no specific purpose. It is a place where any custom user data may be stored. For example, it may be 
    allowed for our users to acces this folder and place there anything they want.

- data

    Contains all the data and files which may be used by our application to persist information

- db

    Contains binary files that are linked to database rows. This is used to avoid storing binary files directly to the database.

- executable

    Contains executable binaries that are required by the application to perform their operations

- logs

    Contains the application logs

- tmp

    Contains temporary application data and it is normally safe to delete the folder contents.