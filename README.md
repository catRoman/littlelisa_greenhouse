/build and /.vsode are ignored 

and .vscode is stashed on each computer higher in the hierachy outside the repo
everything works for build across laptop:wsl:ubuntu and desktop:fedora as of
jan-10-24

sdkconfig gets modified for each independ build and uploaded to repo,
but i assume this just reflects the changes to the local config files and 
does not effect the build,

just need to remmeber to fetch first before modifiy to prevent merge issues,
which shouldnt be an issue,

the sdkconfig will remain shared incase of other development related changes

status lights done -jan 10/24
wifi implementation - started jan 10/24
