idf_component_register(
    SRCS
        wifi_ap_sta.c
        http_server.c
        http_handlers.c
        esp_now_comm.c
        sntp.c
        websocket_server.c
        http_client.c


    REQUIRES
        sensors
        main
        esp_wifi
        app_update




    PRIV_REQUIRES
        nvs_config
        networking
<<<<<<< HEAD
        periphials
=======
        peripherals
>>>>>>> landing_page
        esp_wifi
        nvs_flash
        esp_http_server
        esp_timer
        main
        freertos
        esp_http_client
        esp_https_ota
        json

    INCLUDE_DIRS "include"

    EMBED_FILES
        landing_page/index.html
        landing_page/icons/favicon.png
        landing_page/icons/list.svg
        landing_page/index.js
        landing_page/index.css
)

# target_compile_options(${COMPONENT_LIB} PRIVATE "-fsanitize=undefined" "-O0")