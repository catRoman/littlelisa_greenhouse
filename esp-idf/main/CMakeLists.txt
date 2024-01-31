idf_component_register(
    SRCS 
        main.c 
        rgb_led.c 
        wifi_app.c 
        http_server.c 
        DHT22.c

    INCLUDE_DIRS "."
    
    EMBED_FILES 
        ${CMAKE_CURRENT_LIST_DIR}/../../common/web/esp_main_controller_landing_page/app.css 
        ${CMAKE_CURRENT_LIST_DIR}/../../common/web/esp_main_controller_landing_page/app.js 
        ${CMAKE_CURRENT_LIST_DIR}/../../common/web/esp_main_controller_landing_page/favicon.ico 
        ${CMAKE_CURRENT_LIST_DIR}/../../common/web/esp_main_controller_landing_page/index.html
        ${CMAKE_CURRENT_LIST_DIR}/../../common/web/esp_main_controller_landing_page/jquery-3.3.1.min.js
        )
