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

//TODO implement ntc clock with rtc backup/sync
//TODO capacicance meter driver
//TODO sd card sqlite database
//TODO nvs mem allocation bug fix
//TODO serial parser, for logs
//TODO settings for turing on/off the loging for different services easily

SemaphoreHandle_t wifiInitSemephore = NULL;

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