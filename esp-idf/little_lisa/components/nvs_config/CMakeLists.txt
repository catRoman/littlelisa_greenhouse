idf_component_register(
    SRCS
        nvs_service.c
        node_info.c
        module_config.c
        env_cntrl.c

    REQUIRES
        sensors
        nvs_flash
        driver
<<<<<<< HEAD
        PRIV_REQUIRES
        periphials
=======

    PRIV_REQUIRES
        peripherals
>>>>>>> landing_page
        networking
        sensors
        database_ctrl
        esp_wifi
        esp_http_server
        json
        esp_timer

<<<<<<< HEAD
=======


>>>>>>> landing_page
    INCLUDE_DIRS "include"

)
#target_compile_options(${COMPONENT_LIB} PRIVATE "-fsanitize=undefined" "-O0")
<<<<<<< HEAD
# set_property(TARGET ${periphials} APPEND PROPERTY LINK_INTERFACE_MULTIPLICITY 3)
=======
# set_property(TARGET ${peripherals} APPEND PROPERTY LINK_INTERFACE_MULTIPLICITY 3)
>>>>>>> landing_page
