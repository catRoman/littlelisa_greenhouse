idf_component_register(
    SRCS
        nvs_service.c
        node_info.c
        module_config.c

    REQUIRES
        sensors
        periphials
        nvs_flash

    PRIV_REQUIRES
        networking
        sensors
        database_ctrl
        periphials
        esp_wifi
        esp_http_server
        json
        esp_timer

    INCLUDE_DIRS "include"

)
#target_compile_options(${COMPONENT_LIB} PRIVATE "-fsanitize=undefined" "-O0")
