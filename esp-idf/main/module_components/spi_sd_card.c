#include <string.h>
#include <sys/unistd.h>
#include <sys/stat.h>

#include "esp_vfs_fat.h"
#include "sdmmc_cmd.h"
#include "esp_log.h"
#include "driver/gpio.h"

#include "spi_sd_card.h"


static const char TAG [] = "spi_sd_card";
sdmmc_card_t *card;

esp_err_t spi_sd_card_write(const char *path, char *data)
{
    ESP_LOGI(TAG, "{==WRITE TEST==} Opening file %s", path);
    FILE *file = fopen(path, "w");
    if(file == NULL){
        ESP_LOGE(TAG, "{==WRITE TEST==} Failed to open file for writing");
        return ESP_FAIL;
    }
    fprintf(file, data);
    fclose(file);
    ESP_LOGI(TAG, "{==WRITE TEST==} File written Successfully");

    return ESP_OK;
}

esp_err_t spi_sd_card_read(const char *path)
{
    ESP_LOGI(TAG, "{==READ TEST==} Reading file from %s", path);
    FILE *file = fopen(path, "r");
    if(file == NULL){
        ESP_LOGE(TAG, "{==READ TEST==} Failed to read file");
        return ESP_FAIL;
    }
    char line[MAX_LINE_SIZE];
    fgets(line, sizeof(line), file);
    fclose(file);

    //strip newline
    char *pos = strchr(line, '\n');
    if(pos){
        *pos = '\0';
    }
    ESP_LOGI(TAG, "{==READ TEST==} Read from file-> '%s'", line);
    return ESP_OK;
}

void spi_sd_card_init(void){
     esp_err_t ret;

    gpio_config_t spi_out_conf;

    spi_out_conf = (gpio_config_t){0};

    spi_out_conf.pin_bit_mask = 
        (1ULL<<PIN_NUM_CLK) |   
        (1ULL<<PIN_NUM_CS) |     
        (1ULL<<PIN_NUM_MOSI);

    spi_out_conf.mode = GPIO_MODE_OUTPUT;
    spi_out_conf.pull_up_en = 1;
    spi_out_conf.pull_down_en = 0;

    gpio_config(&spi_out_conf);

       gpio_config_t spi_in_conf;

    // Zero-initialize the config structure.
    spi_in_conf = (gpio_config_t){0};

    // Bit mask of the pins that you want to set,e.g.GPIO18/19
    spi_in_conf.pin_bit_mask = 
        (1UL<<PIN_NUM_MISO);

    spi_in_conf.mode = GPIO_MODE_OUTPUT;
    spi_in_conf.pull_up_en = 1;
    spi_in_conf.pull_down_en = 0;

    gpio_config(&spi_in_conf);

    // Options for mounting the filesystem.
    // If format_if_mount_failed is set to true, SD card will be partitioned and
    // formatted in case when mounting fails.
    esp_vfs_fat_sdmmc_mount_config_t mount_config = {
        .format_if_mount_failed = true,
        .max_files = 5,
        .allocation_unit_size = 16 * 1024
    };
    

    const char mount_point[] = MOUNT_POINT;
    
    ESP_LOGI(TAG, "Initializing SD card");

    // Use settings defined above to initialize SD card and mount FAT filesystem.
    // Note: esp_vfs_fat_sdmmc/sdspi_mount is all-in-one convenience functions.
    // Please check its source code and implement error recovery when developing
    // production applications.
    ESP_LOGI(TAG, "Using SPI peripheral");

    // By default, SD card frequency is initialized to SDMMC_FREQ_DEFAULT (20MHz)
    // For setting a specific frequency, use host.max_freq_khz (range 400kHz - 20MHz for SDSPI)
    // Example: for fixed frequency of 10MHz, use host.max_freq_khz = 10000;
    sdmmc_host_t host = SDSPI_HOST_DEFAULT();

    spi_bus_config_t bus_cfg = {
        .mosi_io_num = PIN_NUM_MOSI,
        .miso_io_num = PIN_NUM_MISO,
        .sclk_io_num = PIN_NUM_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .max_transfer_sz = 4000,
    };

  
    ret = spi_bus_initialize(host.slot, &bus_cfg, SDSPI_DEFAULT_DMA);
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to initialize bus.");
        return;
    }

    // This initializes the slot without card detect (CD) and write protect (WP) signals.
    // Modify slot_config.gpio_cd and slot_config.gpio_wp if your board has these signals.
    sdspi_device_config_t slot_config = SDSPI_DEVICE_CONFIG_DEFAULT();
    slot_config.gpio_cs = PIN_NUM_CS;
    slot_config.host_id = host.slot;
    //gpio_set_pull_mode(PIN_NUM_CS,GPIO_PULLDOWN_ONLY);

    ESP_LOGI(TAG, "Mounting filesystem");
    ret = esp_vfs_fat_sdspi_mount(mount_point, &host, &slot_config, &mount_config, &card);

    if (ret != ESP_OK) {
        if (ret == ESP_FAIL) {
            ESP_LOGE(TAG, "Failed to mount filesystem. "
                     "If you want the card to be formatted, set the CONFIG_EXAMPLE_FORMAT_IF_MOUNT_FAILED menuconfig option.");
        } else {
            ESP_LOGE(TAG, "Failed to initialize the card (%s). "
                     "Make sure SD card lines have pull-up resistors in place.", esp_err_to_name(ret));
        }
        return;
    }
    ESP_LOGI(TAG, "Filesystem mounted");

    // Card has been initialized, print its properties
    sdmmc_card_print_info(stdout, card);
}

void spi_sd_card_test(void){
// Use POSIX and C standard library functions to work with files.
    esp_err_t ret;
    const char mount_point[] = MOUNT_POINT;
    // First create a file.
    const char *file_hello = MOUNT_POINT"/hello.txt";
    char data[MAX_LINE_SIZE];
    snprintf(data, MAX_LINE_SIZE, "%s %s!\n", "Hello", card->cid.name);
    ret = spi_sd_card_write(file_hello, data);
    if (ret != ESP_OK) {
        return;
    }

    const char *file_foo = MOUNT_POINT"/foo.txt";

    // Check if destination file exists before renaming
    struct stat st;
    if (stat(file_foo, &st) == 0) {
        // Delete it if it exists
        unlink(file_foo);
    }

    // Rename original file
    ESP_LOGI(TAG, "Renaming file %s to %s", file_hello, file_foo);
    if (rename(file_hello, file_foo) != 0) {
        ESP_LOGE(TAG, "Rename failed");
        return;
    }

    ret = spi_sd_card_read(file_foo);
    if (ret != ESP_OK) {
        return;
    }

    // Format FATFS
    ret = esp_vfs_fat_sdcard_format(mount_point, card);
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Failed to format FATFS (%s)", esp_err_to_name(ret));
        return;
    }

    if (stat(file_foo, &st) == 0) {
        ESP_LOGI(TAG, "file still exists");
        return;
    } else {
        ESP_LOGI(TAG, "file doesnt exist, format done");
    }

    const char *file_nihao = MOUNT_POINT"/nihao.txt";
    memset(data, 0, MAX_LINE_SIZE);
    snprintf(data, MAX_LINE_SIZE, "%s %s!\n", "Nihao", card->cid.name);
    ret = spi_sd_card_write(file_nihao, data);
    if (ret != ESP_OK) {
        return;
    }

    //Open file for reading
    ret = spi_sd_card_read(file_nihao);
    if (ret != ESP_OK) {
        return;
    }

}

