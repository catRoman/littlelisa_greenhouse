idf_component_register(
    SRCS
        network_components/wifi_app.c
        network_components/http_server.c
        network_components/sntp.c
        module_components/led.c
        module_components/DHT22.c
        module_components/spi_sd_card.c
        module_components/rtc_DS1302.c
        module_components/ds1302.c
        nvs_components/nvs_service.c
        nvs_components/node_info.c
        helper.c
        main.c

    INCLUDE_DIRS "."

    EMBED_FILES
        esp_main_controller_landing_page/app.css
        esp_main_controller_landing_page/app.js
        esp_main_controller_landing_page/favicon.ico
        esp_main_controller_landing_page/index.html
        esp_main_controller_landing_page/jquery-3.3.1.min.js)
