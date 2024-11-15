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
        -main/wifi_app.c --> added call to http server start
    added:
        -main/webpage/app.css
        -main/webpage/app.js
        -main/webpage/favicon.ico
        -main/webpage/index.html
        -main/webpage/jquery-3.3.1.min.js
        -main/http_server.c
        -main/http_server.h

OTA firmware update -- started jan 11
    updated:
        -http_server.c --> added ota functionality
        -http_server.h
   

    finished jan 11

DHT22 Implementaion started jan 11/24
    updated:
        -/main/CMakeList.txt --> added DHT22.c
        -main/task_common.h --> added dht22 task
        -main/DHT22.h --> added task start protoype
        -main/DHT22.c --> replaced ets_delay_us() w/ esp_rom_daly_us(), 
                      --> (jan12) commented out serial data sensor data
        index.html -->(jan 12) divs for sensor data
        app.js -->(jan 12) function call for recieving data
        app.css -->(jan 12) for added sensor div
        http_server -->((jan 12)) created and registorered dhtsensor.json handler

    added:
        -main/DHT22.c --> dht driver
        -main/DHT22.h --> dht driver header

    finished jan 12

jan 13 - a short in the breadboard cause by condensation dropping from
    greenhouse roof cause me to switch out all components onto a new,
    protoytpe inside a plastic case, added a second sensor for external temp and exending the internal temp further from the greenhouse wall. replaced the 
    pwm rgb led for a simpler 3 light single led on/off aproach.

    added second sensor to the webpage, es32 seems to have difficulty
    maintaing the web server at random points, will still look into
    server for that purpose, 

    will need to figure out connectivity issues, i set a booster halfway but it only work itermiddantly, will try different channel
    i soped it out and its preatty full but i could experiment, oreder
    new chips and antenna to hopefull help extend the range so ii dont need to hardwire anything, 

    will start looking into making a server, the wifi card may be better

    all the while i was working on this tonight the propane heater in 
    greenhouse was acting up mstliky oil in the fuel line snuffing
    out the pilot so ive been monitor, proof of concept i could tell
    when the heater shut off do to the quick decrease in temp, could
    easily write code to send me a text when this occurs to notifiy me
    of that, also need to buy a fuel filter lol

        updated:
            -main/rgb_led.c --> led.c     ---> removed pwm functionality
            -main/rgb_led.h --> led.h
            -main/CMakeLists.txt --> update to express this change
            -main/DHT22.c       --> removed globals and replaced with
            -main/DHT22.h           struct, allowing for different
                                    instances of dht22 sensors, set
                                    up for a second sensor on a different pin
            -main/http_server.c --> added uri handler and dealth with   
                                    http requests for both sensors
                                    (inside/outside)
            -main/website/index.html --> add div for fetch json data
            -main/website/app.css   --> add style for new section
            -main/website/app.js --> function to fetch json data

            *added a remote branch to track this current path and decided to use this as my actual protoype branch, will be shifting back to laptop-dev branch to learn in a more straightforward, areana but will apply it to the new branch



    
