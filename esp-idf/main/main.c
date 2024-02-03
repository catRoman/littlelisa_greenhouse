/**
 * @file		main.c
 * @brief		Application entry point
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 */
#include <time.h>
#include <sys/time.h>

#include "nvs_flash.h"

#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "wifi_app.h"
#include "DHT22.h"
#include "nvs_service.h"
#include "sntp_rtc.h"
#include "spi_sd_card.h"

//TODO implement ntc clock with rtc backup/sync
//TODO capacicance meter driver
//TODO sd card sqlite database 
//TODO nvs mem allocation bug fix
//TODO serial parser, for logs
//TODO settings for turing on/off the loging for different services easily

SemaphoreHandle_t wifiInitSemephore = NULL;


/**
 * freeRTOS function invocation
*/
void app_main(void)
{

    wifiInitSemephore = xSemaphoreCreateMutex();

    //wifi crediental storage and retrieval 
    nvs_initiate();

    //synced system clock
    sntp_rtc_init();

    // Start Wifi
    wifi_app_start();
    
    // backup sd database
    spi_sd_card_init();
    
    // start DHT22 Sensor task
    DHT22_sensor_task_start();

    vTaskDelay(15000/ portMAX_DELAY);
  

}