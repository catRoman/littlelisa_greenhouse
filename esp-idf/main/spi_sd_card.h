/**
 * spi_sd_card.h
 * 
 * Created on: 2024-02-03
 * Author: Catlin Roman
*/

#include "spi_sd_card.c"

#ifndef MAIN_SPI_SD_CARD_H_
#define MAIN_SPI_SD_CARD_H_

#define PIN_NUM_MOSI        15 //ok
#define PIN_NUM_MISO        2 //ok
#define PIN_NUM_CLK         14 //4
#define PIN_NUM_CS          13 //5


#define MOUNT_POINT "/sd_database"
#define MAX_LINE_SIZE 120

// pin set

esp_err_t spi_sd_card_write_test(const char *path char *data);

esp_err_t spi_sd_card_read_test(const char *path)

void spi_sd_card_init(void);

#endif