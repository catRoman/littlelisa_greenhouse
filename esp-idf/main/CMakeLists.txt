idf_component_register(
    SRCS
        sensor_components/sensor_tasks.h
        sensor_components/DHT22.c
        network_components/wifi_ap_sta.c
        network_components/http_server.c
        network_components/http_handlers.c
        network_components/esp_now_comm.c
        network_components/sntp.c
        module_components/led.c
        module_components/spi_sd_card.c
        module_components/rtc_DS1302.c
        module_components/ds1302.c
        database_components/sd_card_db.c
        nvs_components/nvs_service.c
        nvs_components/node_info.c
        nvs_components/module_config.c
        helper.c
        main.c
        

    INCLUDE_DIRS "."

    EMBED_FILES
        landing_page/index.html
        landing_page/plant3.svg
        landing_page/assets/index.js
        landing_page/assets/index.css
)