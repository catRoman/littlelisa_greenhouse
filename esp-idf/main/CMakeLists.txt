idf_component_register(
    SRCS
        helper.c
        main.c
    
    PRIV_REQUIRES
        networking
        nvs_config
        nvs_flash

    INCLUDE_DIRS "include"

)