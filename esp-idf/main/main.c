/**
 * @file		main.c
 * @brief		Application entry point
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 */

#include "nvs_flash.h"

#include "wifi_app.h"
#include "DHT22.h"
#include "nvs_service.h"

//TODO implement ntc clock with rtc backup/sync
//TODO capacicance meter driver
//TODO sd card sqlite database 
//TODO nvs mem allocation bug fix
//TODO serial parser, for logs
//TODO settings for turing on/off the loging for different services easily

/**
 * freeRTOS function invocation
*/
void app_main(void)
{
    // Initialize NVS
    nvs_initiate();
    
    // Start Wifi
    wifi_app_start();
    

    // start DHT22 Sensor task
    DHT22_sensor_task_start();
}
