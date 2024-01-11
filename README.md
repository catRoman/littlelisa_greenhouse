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
    rgb_led.c added
    rgb_led.h added

wifi implementation - started jan 10/24
    updated:
        -main/CMakeList.txt     --> added wifi_app.c
        -main/main.c            --> changed to drive wifi_app.c
    added:
        -main/tasks_common.h
        -main/wifi_app.h
        -main/wifi_app.c
        -.vscode/c_code.code-snippets   --->file header macro

    finished jan 10/24 --> working on laptop:wsl:ubuntu

http server -- started jan 10/24
    updated:
        -main/CMakeList.txt --> added embed filed from website/
                            --> add http_Server.c
        -main/task_common.h --> added http server task, http monitor task
    added:
        -webpage/app.css
        -webpage/app.js
        -webpage/favicon.ico
        -webpage/index.html
        -webpage/jquery-3.3.1.min.js
        -main/http_server.c
        -main/http_server.h