idf_component_register(
    SRCS
        wifi_ap_sta.c
        http_server.c
        http_handlers.c
        esp_now_comm.c
        sntp.c
        websocket_server.c


    REQUIRES 
        sensors
        main
        esp_wifi
        app_update
    

    PRIV_REQUIRES
        nvs_config
        networking
        periphials
        esp_wifi
        nvs_flash
        esp_http_server
        esp_timer


    INCLUDE_DIRS "include"

    EMBED_FILES
        landing_page/index.html
        landing_page/plant3.svg
        landing_page/assets/index.js
        landing_page/assets/index.css
)