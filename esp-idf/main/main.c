/**
 * @file		main.c
 * @brief		Application entry point
 *
 * @author		Catlin Roman
 * @date 		created on: 2024-01-10
 */

#include "nvs_flash.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "freertos/task.h"

#include "network_components/wifi_ap_sta.h"
#include "nvs_components/nvs_service.h"
#include "nvs_components/module_config.h"


//TODO: esp-now feature
//TODO: kconfig for module config using kconfig files
//TODO config file for all sensors structures and tasks
//TODO: create database - send sensor data to db, and ram
//TODO: db health check for recovery attempts if needed
//TODO: database erro alert -email/led light etc
//TODO: update landing page to retrieve data from db or ram if db down
//TODO: ota firmwar update
//TODO dynamicly add link to all available node landing pages based on connected nodes
//TODO adjust nvs module info storage and module implemntation based on config
//TODO: remove node list from nvs (rely dynamicaly based on connected devices)
//TODO: heartbeat mechanism for esp-now connected nodes (along with active ping?)
//TODO: ACK mechanism for espnow data transmission
//TODO: watchdog timer for nodes transmitting data
//TODO: add device and system information to debug page to monitor device health
//TODO mdns setup to allow for garenteed access to node landing pages
//TODO: check if sdk changed nvs data then write otherwise pass




/**
 * freeRTOS function invocation
*/
void app_main(void)
{
    static const char TAG[] = "main_app";

     //wifi crediental storage and retrieval
    nvs_initiate();
   
    // Start Wifi
    wifi_start();

    initiate_config();

    // start DHT22 Sensor task

    vTaskDelay(5000/ portMAX_DELAY);

    //DHT22_sensor_task_start();

}