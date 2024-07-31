idf_component_register(
    SRCS
        sensor_tasks.c
        DHT22.c
        sensor_helpers.c

    INCLUDE_DIRS "include"

    REQUIRES
        esp_http_client

    PRIV_REQUIRES
        nvs_config
        networking
        driver
        json
        esp_http_server
        esp_http_client
        peripherals

)

# target_compile_options(${COMPONENT_LIB} PRIVATE "-fsanitize=undefined" "-O0" )