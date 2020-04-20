# How to make the project available to the public

1 - Update all the project dependencies if necessary
    (See the related help file for docs on how to upgrade dependencies)
    
2 - Make sure all tests pass

3 - Commit and push all the new version changes to repository.

4 - Make sure the _dev and _trash remote ftp folders are empty. If not, delete its contents

5 - Generate a release build (tb -cr)

6 - Once build is finished, move the site remote ftp folder to the _trash remote ftp folder

7 - Go into the remote _dev folder and move all its contents outside it

8 - Test that site works as expected