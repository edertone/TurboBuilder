# How to make the project available to the public

1 - Commit and push all the new version changes to repository.

2 - Make sure the release remote ftp folder is empty. If not, delete its contents

3 - Generate a release build (tb -cr)

4 - Once build is finished, move the site remote ftp folder to the trash remote ftp folder

5 - Go into the remote release folder and move all its contents outside it

6 - Test that site works as expected