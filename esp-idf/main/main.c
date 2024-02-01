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
