idf_component_register(
    SRCS
        nvs_service.c
        node_info.c
        module_config.c

    REQUIRES 
        sensors
    
    PRIV_REQUIRES
        networking
        sensors
        database_ctrl
        periphials
        esp_wifi
        esp_http_server
        nvs_flash
        json
    
    INCLUDE_DIRS "include"

)