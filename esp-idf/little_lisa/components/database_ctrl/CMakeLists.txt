idf_component_register(
    SRCS
        sd_card_db.c
<<<<<<< HEAD
    
    PRIV_REQUIRES
        periphials
=======

    PRIV_REQUIRES
        peripherals
>>>>>>> landing_page
        esp_timer
        fatfs
        esp32-idf-sqlite3


    INCLUDE_DIRS "include"

)