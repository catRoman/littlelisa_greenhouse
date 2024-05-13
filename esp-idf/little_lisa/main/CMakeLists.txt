idf_component_register(
    SRCS
        helper.c
        main.c
        task_common.c

    PRIV_REQUIRES
        networking
        nvs_config
        nvs_flash
        freertos

    INCLUDE_DIRS "include"

)