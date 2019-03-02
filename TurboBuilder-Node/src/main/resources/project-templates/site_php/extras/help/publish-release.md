# How to make the project available to the public

1 - Make sure all tests pass

2 - Commit and push all the new version changes to repository.

3 - Make sure the release remote ftp folder is empty. If not, delete its contents

4 - Generate a release build (tb -cr)

5 - Once build is finished, move the site remote ftp folder to the trash remote ftp folder

6 - Go into the remote release folder and move all its contents outside it

7 - Test that site works as expected