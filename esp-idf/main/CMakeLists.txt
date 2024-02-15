idf_component_register(
    SRCS
        main.c
        led.c
        wifi_app.c
        http_server.c
        DHT22.c
        nvs_service.c
        sntp.c
        spi_sd_card.c
        rtc_DS1302.c

    INCLUDE_DIRS "."

    EMBED_FILES
        esp_main_controller_landing_page/app.css
        esp_main_controller_landing_page/app.js
        esp_main_controller_landing_page/favicon.ico
        esp_main_controller_landing_page/index.html
        esp_main_controller_landing_page/jquery-3.3.1.min.js)
