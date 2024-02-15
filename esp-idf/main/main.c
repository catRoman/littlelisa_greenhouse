/**
 * @file		main.c
 * @brief		Application entry point
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 */
#include <time.h>
#include <sys/time.h>
#include <string.h>

#include "nvs_flash.h"

#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "freertos/task.h"
#include "wifi_app.h"
#include "DHT22.h"
#include "nvs_service.h"
#include "sntp.h"
#include "spi_sd_card.h"
#include "rtc_DS1302.h"
#include "ds1302.h"
#include "node_info.h"

//TODO implement ntc clock with rtc backup/sync
//TODO capacicance meter driver
//TODO sd card sqlite database
//TODO nvs mem allocation bug fix
//TODO serial parser, for logs
//TODO settings for turing on/off the loging for different services easily

SemaphoreHandle_t wifiInitSemephore = NULL;
Module_info_t module_info = {
    .type = "Controller",
    .location = "Power Board",
    .identity = 0
};

/**
 * node identity numbers including self
*/
int8_t node_arr[1] = {0};

/**
 * sensor list 
 * 
 * 0 - temp
 * 1 - humidity
 * 2 - soil moisture
 * 4 - light
 * 5 - sound
 * 6 - movement
 * 7 - cam
*/
int8_t sensor_arr[7] = {2,  // temp
                        2,  // humidity
                        0,  // soil moisture
                        0,  // light
                        0,  // sound
                        0,  // movement
                        0,  // cam
                        };

char * binary_string( uint8_t decNum )
{
    char * binaryString = malloc(sizeof(char)*11);
    char * bitString= malloc(sizeof(char)*9);

    int k = 8;
    for(unsigned int i = 0; i <=8; i++){
        bitString[--k] = (((decNum >> i) & 1) ? '1' : '0');
    }
    bitString[8]='\0';
    binaryString[0] = '0';
    binaryString[1]='b';
    binaryString[2]='\0';

    strcat(binaryString, bitString);


    return binaryString;
}

/**
 * freeRTOS function invocation
*/
void app_main(void)
{

    wifiInitSemephore = xSemaphoreCreateMutex();

    //wifi crediental storage and retrieval
    nvs_initiate();

    nvs_set_module(module_info.type, module_info.location, module_info.identity);
    nvs_set_node_arr(&node_arr, 1);
    nvs_set_sensor_arr(&sensor_arr, 7);

    
    //synced system clock
    sntp_service_init();

    // Start Wifi
    wifi_app_start();

    // backup sd database
    spi_sd_card_init();

    // start DHT22 Sensor task
    DHT22_sensor_task_start();

    vTaskDelay(15000/ portMAX_DELAY);




}