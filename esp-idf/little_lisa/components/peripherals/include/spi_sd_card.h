/**
 * spi_sd_card.h
 *
 * Created on: 2024-02-03
 * Author: Catlin Roman
 */

#ifndef PERIPHERALS_SPI_SD_CARD_H_
#define PERIPHERALS_SPI_SD_CARD_H_

#include "esp_err.h"

#define PIN_NUM_MOSI 23
#define PIN_NUM_MISO 19
#define PIN_NUM_CLK 18
#define PIN_NUM_CS 5

#define OTA_FILENAME "/sdcard/ota.bin"
#define MOUNT_POINT "/sdcard"
#define MAX_LINE_SIZE 120

// pin set

esp_err_t spi_sd_card_write(const char *path, char *data);

esp_err_t spi_sd_card_read(const char *path);

void spi_sd_card_init(void);

void spi_sd_card_test(void);

esp_err_t ota_update_from_sd(void);

#endif