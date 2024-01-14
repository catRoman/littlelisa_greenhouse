idf_component_register(SRCS main.c led.c wifi_app.c http_server.c DHT22.c
                    INCLUDE_DIRS "."
                    EMBED_FILES website/app.css website/app.js website/favicon.ico website/index.html website/jquery-3.3.1.min.js)
