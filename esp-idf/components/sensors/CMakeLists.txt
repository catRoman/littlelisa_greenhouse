idf_component_register(
    SRCS
        sensor_tasks.c
        DHT22.c

    INCLUDE_DIRS "include"

    PRIV_REQUIRES 
        nvs_config
        networking
        driver
        json
        esp_http_server

)

target_compile_options(${COMPONENT_LIB} PRIVATE "-fsanitize=undefined" )