/**
 * @file		main.c
 * @brief		Application entry point
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 */

#include "nvs_flash.h"

#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "wifi_app.h"
#include "DHT22.h"
#include "nvs_service.h"
#include "sntp_rtc.h"

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

    // Initialize NVS
    nvs_initiate();
    
    // Start Wifi
    wifi_app_start();
    
    sntp_test();
    // start DHT22 Sensor task
    DHT22_sensor_task_start();
}