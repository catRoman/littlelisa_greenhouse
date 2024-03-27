idf_component_register(
    SRCS
        sd_card_db.c
    
    PRIV_REQUIRES
        periphials
        esp_timer
        fatfs
        esp32-idf-sqlite3


    INCLUDE_DIRS "include"

)