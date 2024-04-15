idf_component_register(
    SRCS
        led.c
        spi_sd_card.c
        rtc_DS1302.c
        ds1302.c

    REQUIRES
        driver

    PRIV_REQUIRES
        fatfs
        app_update

    INCLUDE_DIRS "include"

)